import { supabase } from "@/integrations/supabase/client";
import { isSupportFile, normalizeProjectPath } from "@/lib/project-file-kinds";

// Archive handling for project uploads — grab every useful text file out of a .zip.
export const ZIP_EXT = /\.zip$/i;
export const UNSUPPORTED_ARCHIVE_EXT = /\.(7z|rar)$/i;
// Files the redesign engine can rewrite. Keep in sync with TEXT_EXT in src/lib/redesign.functions.ts.
export const REDESIGNABLE_EXT =
  /\.(html?|css|scss|sass|less|js|jsx|ts|tsx|vue|svelte|json|md|mdx|txt|xml|svg|astro|php|hbs|ejs|twig|dart|kt|swift|py)$/i;
// Extra text files kept for the SEO Agent and project context (never redesigned).
const SUPPORT_EXT = /\.(ya?ml|toml|webmanifest|mjs|cjs|mts|cts)$/i;
const SUPPORT_BASENAMES = new Set([".htaccess", "_redirects", "_headers"]);

const JUNK_PATH_SEGMENTS = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  ".next/",
  ".turbo/",
  ".cache/",
  "coverage/",
  ".vercel/",
  ".netlify/",
  "out/",
  "__macosx/",
];
const JUNK_BASENAMES = new Set([
  // lockfiles — huge, machine-generated, useless for redesign or SEO
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lock",
  "bun.lockb",
  "composer.lock",
  "cargo.lock",
  "pipfile.lock",
  "poetry.lock",
  ".ds_store",
]);
const GENERATED_FILE_PATTERN = /(\.gen\.tsx?|\.d\.ts|\.min\.(?:js|css)|\.map)$/i;
// Never import secrets.
const SECRET_FILE_PATTERN = /(^|\/)\.env(?:\.[\w-]+)?$/i;
const MAX_EXTRACTED_FILES = 300;

function isJunkArchivePath(path: string) {
  const lower = path.toLowerCase();
  if (JUNK_PATH_SEGMENTS.some((seg) => lower.includes(seg))) return true;
  if (GENERATED_FILE_PATTERN.test(lower) || SECRET_FILE_PATTERN.test(lower)) return true;
  const base = lower.split("/").pop() ?? lower;
  return JUNK_BASENAMES.has(base);
}

function isWantedArchivePath(path: string) {
  const base = (path.split("/").pop() ?? path).toLowerCase();
  return REDESIGNABLE_EXT.test(path) || SUPPORT_EXT.test(path) || SUPPORT_BASENAMES.has(base);
}

export type UploadResult = {
  /** Set when at least one archive was extracted, describing what happened. */
  archiveNotice: string | null;
  /** Set when something in the batch failed or was refused. */
  error: string | null;
};

type ExistingRow = { id: string; name: string; storage_path: string | null; created_at: string };

/**
 * Loads the project's current files keyed by normalized path, and removes any
 * duplicate rows that share a path (keeping the oldest), so re-uploads never pile up.
 */
async function loadExistingFiles(projectId: string) {
  const { data, error } = await supabase
    .from("project_files")
    .select("id, name, storage_path, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const byPath = new Map<string, ExistingRow>();
  const duplicates: ExistingRow[] = [];
  for (const row of (data ?? []) as ExistingRow[]) {
    const key = normalizeProjectPath(row.name).toLowerCase();
    if (byPath.has(key)) duplicates.push(row);
    else byPath.set(key, row);
  }

  if (duplicates.length > 0) {
    const ids = duplicates.map((row) => row.id);
    for (let i = 0; i < ids.length; i += 100) {
      const { error: delErr } = await supabase.from("project_files").delete().in("id", ids.slice(i, i + 100));
      if (delErr) throw delErr;
    }
    const paths = duplicates.map((row) => row.storage_path).filter((p): p is string => Boolean(p));
    if (paths.length > 0) await supabase.storage.from("project-files").remove(paths);
  }

  return { byPath, removedDuplicates: duplicates.length };
}

const RESET_TRANSFORM = {
  status: "queued",
  redesigned_content: null,
  redesign_error: null,
} as const;

async function runInChunks<T>(items: T[], size: number, fn: (item: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

async function uploadPlainFile(opts: {
  file: File;
  userId: string;
  projectId: string;
  targetStyle: string | null;
  existing: Map<string, ExistingRow>;
}): Promise<"added" | "updated"> {
  const { file, userId, projectId, targetStyle, existing } = opts;
  const path = `${userId}/${projectId}/${Date.now()}-${file.name}`;
  const { error: upErr } = await supabase.storage.from("project-files").upload(path, file);
  if (upErr) throw upErr;

  const key = normalizeProjectPath(file.name).toLowerCase();
  const match = existing.get(key);
  if (match) {
    const { error: rowErr } = await supabase
      .from("project_files")
      .update({
        ...RESET_TRANSFORM,
        storage_path: path,
        content: null,
        size_bytes: file.size,
        updated_at: new Date().toISOString(),
      })
      .eq("id", match.id);
    if (rowErr) throw rowErr;
    if (match.storage_path) await supabase.storage.from("project-files").remove([match.storage_path]);
    existing.set(key, { ...match, storage_path: path });
    return "updated";
  }

  const { data: inserted, error: rowErr } = await supabase
    .from("project_files")
    .insert({
      project_id: projectId,
      user_id: userId,
      name: file.name,
      source: "upload",
      storage_path: path,
      size_bytes: file.size,
      target_style: targetStyle,
    })
    .select("id, name, storage_path, created_at")
    .single();
  if (rowErr) throw rowErr;
  if (inserted) existing.set(key, inserted as ExistingRow);
  return "added";
}

/** Extracts a .zip client-side; new paths are added, paths already in the project are replaced. */
async function uploadArchive(opts: {
  archive: File;
  userId: string;
  projectId: string;
  targetStyle: string | null;
  existing: Map<string, ExistingRow>;
}): Promise<string> {
  const { archive, userId, projectId, targetStyle, existing } = opts;
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(archive);
  type ZipEntry = { name: string; dir: boolean; async: (type: "string") => Promise<string> };
  const entries = (Object.values(zip.files) as ZipEntry[]).filter((entry) => !entry.dir);

  // If everything lives under one shared top-level folder (typical repo zip), drop it.
  const paths = entries.map((entry) => entry.name);
  const topLevelFolders = new Set(paths.map((p) => p.split("/")[0] ?? ""));
  const [onlyFolder] = topLevelFolders;
  const singleRoot = topLevelFolders.size === 1 && paths.every((p) => p.includes("/"));
  const stripPrefix = singleRoot ? `${onlyFolder}/` : "";

  type Extracted = { name: string; content: string; size: number };
  const extracted = new Map<string, Extracted>();
  let skipped = 0;
  let capped = false;

  for (const entry of entries) {
    const cleanPath = normalizeProjectPath(
      stripPrefix && entry.name.startsWith(stripPrefix) ? entry.name.slice(stripPrefix.length) : entry.name,
    );
    if (!cleanPath || isJunkArchivePath(entry.name) || !isWantedArchivePath(cleanPath)) {
      skipped += 1;
      continue;
    }
    if (extracted.size >= MAX_EXTRACTED_FILES) {
      skipped += 1;
      capped = true;
      continue;
    }
    const text = await entry.async("string");
    if (!text.trim()) {
      skipped += 1;
      continue;
    }
    extracted.set(cleanPath.toLowerCase(), { name: cleanPath, content: text, size: new Blob([text]).size });
  }

  const toInsert: Extracted[] = [];
  const toUpdate: Array<{ row: ExistingRow; file: Extracted }> = [];
  for (const [key, file] of extracted) {
    const match = existing.get(key);
    if (match) toUpdate.push({ row: match, file });
    else toInsert.push(file);
  }

  const now = new Date().toISOString();
  await runInChunks(toUpdate, 10, async ({ row, file }) => {
    const { error } = await supabase
      .from("project_files")
      .update({ ...RESET_TRANSFORM, content: file.content, size_bytes: file.size, storage_path: null, updated_at: now })
      .eq("id", row.id);
    if (error) throw error;
  });
  const oldStorage = toUpdate.map(({ row }) => row.storage_path).filter((p): p is string => Boolean(p));
  if (oldStorage.length > 0) await supabase.storage.from("project-files").remove(oldStorage);

  for (let i = 0; i < toInsert.length; i += 100) {
    const batch = toInsert.slice(i, i + 100).map((file) => ({
      project_id: projectId,
      user_id: userId,
      name: file.name,
      source: "upload",
      content: file.content,
      size_bytes: file.size,
      target_style: targetStyle,
    }));
    const { data, error } = await supabase.from("project_files").insert(batch).select("id, name, storage_path, created_at");
    if (error) throw error;
    for (const row of (data ?? []) as ExistingRow[]) existing.set(normalizeProjectPath(row.name).toLowerCase(), row);
  }

  const supportCount = [...extracted.values()].filter((file) => isSupportFile(file.name)).length;
  const parts = [`${archive.name}: ${toInsert.length} new file${toInsert.length === 1 ? "" : "s"} added`];
  if (toUpdate.length > 0) parts.push(`${toUpdate.length} existing file${toUpdate.length === 1 ? "" : "s"} replaced (no duplicates)`);
  if (supportCount > 0) parts.push(`${supportCount} config/SEO file${supportCount === 1 ? "" : "s"} kept for the SEO Agent and left unstyled`);
  if (skipped > 0) parts.push(`skipped ${skipped} (images, binaries, lockfiles, build output or secrets)`);
  if (capped) parts.push(`capped at ${MAX_EXTRACTED_FILES} files`);
  return `${parts.join(" — ")}.`;
}

/**
 * Uploads a FileList to a project, transparently extracting any .zip archives.
 * Re-uploading the same files replaces them instead of adding duplicates.
 * Shared by the style-picker workspace and Rezyn Chat.
 */
export async function uploadFileList(opts: {
  list: FileList;
  userId: string;
  projectId: string;
  targetStyle: string | null;
}): Promise<UploadResult> {
  const { list, userId, projectId, targetStyle } = opts;
  const notices: string[] = [];
  let error: string | null = null;

  const { byPath: existing, removedDuplicates } = await loadExistingFiles(projectId);
  if (removedDuplicates > 0) notices.push(`Removed ${removedDuplicates} duplicate file${removedDuplicates === 1 ? "" : "s"} from earlier uploads.`);

  let added = 0;
  let updated = 0;
  for (const file of Array.from(list)) {
    try {
      if (UNSUPPORTED_ARCHIVE_EXT.test(file.name)) {
        error = `${file.name}: 7z and RAR aren't supported yet — please re-zip as .zip, or upload the files individually.`;
        continue;
      }
      if (ZIP_EXT.test(file.name)) {
        notices.push(await uploadArchive({ archive: file, userId, projectId, targetStyle, existing }));
        continue;
      }
      const outcome = await uploadPlainFile({ file, userId, projectId, targetStyle, existing });
      if (outcome === "added") added += 1;
      else updated += 1;
    } catch (err) {
      error = err instanceof Error ? err.message : `${file.name}: upload failed`;
    }
  }
  if (updated > 0) notices.push(`${updated} file${updated === 1 ? "" : "s"} replaced with the new version${added > 0 ? `, ${added} added` : ""}.`);

  return { archiveNotice: notices.length > 0 ? notices.join(" ") : null, error };
}
