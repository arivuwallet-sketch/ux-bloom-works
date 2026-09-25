import { supabase } from "@/integrations/supabase/client";

// Archive handling for project uploads — grab every redesignable file out of a .zip.
export const ZIP_EXT = /\.zip$/i;
export const UNSUPPORTED_ARCHIVE_EXT = /\.(7z|rar)$/i;
// Keep this list in sync with the server's TEXT_EXT in src/lib/redesign.functions.ts —
// only files it can actually send to the AI are worth pulling out of an archive.
export const REDESIGNABLE_EXT =
  /\.(html?|css|scss|sass|less|js|jsx|ts|tsx|vue|svelte|json|md|mdx|txt|xml|svg|astro|php|hbs|ejs|twig|dart|kt|swift|py)$/i;

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
];
const JUNK_BASENAMES = new Set([
  // lockfiles
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lock",
  "bun.lockb",
  "composer.lock",
  "cargo.lock",
  "pipfile.lock",
  "poetry.lock",
  // manifests/config — technically text, but not UI to redesign
  "package.json",
  "tsconfig.json",
  "tsconfig.app.json",
  "tsconfig.node.json",
  "components.json",
  "composer.json",
]);
const GENERATED_FILE_PATTERN = /(\.gen\.tsx?|\.d\.ts)$/i;
const MAX_EXTRACTED_FILES = 300;

function isJunkArchivePath(path: string) {
  const lower = path.toLowerCase();
  if (JUNK_PATH_SEGMENTS.some((seg) => lower.includes(seg))) return true;
  if (GENERATED_FILE_PATTERN.test(lower)) return true;
  const base = lower.split("/").pop() ?? lower;
  return JUNK_BASENAMES.has(base);
}

export type UploadResult = {
  /** Set when at least one archive was extracted, describing what happened. */
  archiveNotice: string | null;
  /** Set when something in the batch failed or was refused. */
  error: string | null;
};

async function uploadPlainFile(opts: {
  file: File;
  userId: string;
  projectId: string;
  targetStyle: string | null;
}) {
  const { file, userId, projectId, targetStyle } = opts;
  const path = `${userId}/${projectId}/${Date.now()}-${file.name}`;
  const { error: upErr } = await supabase.storage.from("project-files").upload(path, file);
  if (upErr) throw upErr;
  const { error: rowErr } = await supabase.from("project_files").insert({
    project_id: projectId,
    user_id: userId,
    name: file.name,
    source: "upload",
    storage_path: path,
    size_bytes: file.size,
    target_style: targetStyle,
  });
  if (rowErr) throw rowErr;
}

/** Extracts a .zip client-side and inserts one row per redesignable file inside it. */
async function uploadArchive(opts: {
  archive: File;
  userId: string;
  projectId: string;
  targetStyle: string | null;
}): Promise<string> {
  const { archive, userId, projectId, targetStyle } = opts;
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(archive);
  // Typed explicitly rather than relied-on inference from zip.files, so this doesn't
  // depend on exactly how JSZip's bundled types resolve in a given build.
  type ZipEntry = { name: string; dir: boolean; async: (type: "string") => Promise<string> };
  const entries = (Object.values(zip.files) as ZipEntry[]).filter((entry) => !entry.dir);

  // If everything lives under one shared top-level folder (the common case for a
  // downloaded repo zip), drop that folder name so paths read cleanly.
  const paths = entries.map((entry) => entry.name);
  const topLevelFolders = new Set(paths.map((p) => p.split("/")[0] ?? ""));
  const [onlyFolder] = topLevelFolders;
  const singleRoot = topLevelFolders.size === 1 && paths.every((p) => p.includes("/"));
  const stripPrefix = singleRoot ? `${onlyFolder}/` : "";

  type NewFileRow = {
    project_id: string;
    user_id: string;
    name: string;
    source: string;
    content: string;
    size_bytes: number;
    target_style: string | null;
  };
  const rows: NewFileRow[] = [];
  let skipped = 0;

  for (const entry of entries) {
    const cleanPath =
      stripPrefix && entry.name.startsWith(stripPrefix)
        ? entry.name.slice(stripPrefix.length)
        : entry.name;
    if (!cleanPath || isJunkArchivePath(entry.name) || !REDESIGNABLE_EXT.test(cleanPath)) {
      skipped += 1;
      continue;
    }
    if (rows.length >= MAX_EXTRACTED_FILES) {
      skipped += 1;
      continue;
    }
    const text = await entry.async("string");
    if (!text.trim()) {
      skipped += 1;
      continue;
    }
    rows.push({
      project_id: projectId,
      user_id: userId,
      name: cleanPath,
      source: "upload",
      content: text,
      size_bytes: new Blob([text]).size,
      target_style: targetStyle,
    });
  }

  if (rows.length > 0) {
    const { error: rowErr } = await supabase.from("project_files").insert(rows);
    if (rowErr) throw rowErr;
  }

  const parts = [
    `Extracted ${rows.length} redesignable file${rows.length === 1 ? "" : "s"} from ${archive.name}`,
  ];
  if (skipped > 0) parts.push(`skipped ${skipped} (binaries, config, or lockfiles)`);
  if (rows.length >= MAX_EXTRACTED_FILES) parts.push(`capped at ${MAX_EXTRACTED_FILES} files`);
  return `${parts.join(" — ")}.`;
}

/**
 * Uploads a FileList to a project, transparently extracting any .zip archives into
 * individual redesignable file rows. Shared by the style-picker workspace and Rezyn Chat.
 */
export async function uploadFileList(opts: {
  list: FileList;
  userId: string;
  projectId: string;
  targetStyle: string | null;
}): Promise<UploadResult> {
  const { list, userId, projectId, targetStyle } = opts;
  let archiveNotice: string | null = null;
  let error: string | null = null;

  for (const file of Array.from(list)) {
    try {
      if (UNSUPPORTED_ARCHIVE_EXT.test(file.name)) {
        error = `${file.name}: 7z and RAR aren't supported yet — please re-zip as .zip, or upload the files individually.`;
        continue;
      }
      if (ZIP_EXT.test(file.name)) {
        archiveNotice = await uploadArchive({ archive: file, userId, projectId, targetStyle });
        continue;
      }
      await uploadPlainFile({ file, userId, projectId, targetStyle });
    } catch (err) {
      error = err instanceof Error ? err.message : `${file.name}: upload failed`;
    }
  }

  return { archiveNotice, error };
}
