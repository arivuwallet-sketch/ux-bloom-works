import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Download, Send, Sparkles, UploadCloud } from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { Section, SectionHeading } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadFileList } from "@/lib/upload-files";
import { downloadProjectZip } from "@/lib/download-zip";
import { sendChatMessage } from "@/lib/chat-redesign.functions";

export const Route = createFileRoute("/projects/$projectId_/chat")({
  head: () => ({
    meta: [
      { title: "Rezyn Chat — conversational redesign" },
      {
        name: "description",
        content:
          "Describe the change you want in plain language and Rezyn Chat rewrites the file live, one turn at a time.",
      },
      { property: "og:title", content: "Rezyn Chat — conversational redesign" },
      {
        property: "og:description",
        content: "Upload a project and redesign it by chatting — no style picker required.",
      },
    ],
  }),
  component: ChatRedesignPage,
});

const ALL_FILES = "all";

function ChatRedesignPage() {
  const { projectId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendChat = useServerFn(sendChatMessage);

  const [activeFileId, setActiveFileId] = useState<string>(ALL_FILES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [archiveNotice, setArchiveNotice] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const project = useQuery({
    queryKey: ["project", projectId],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("projects")
        .select("id, name, product_type")
        .eq("id", projectId)
        .maybeSingle();
      if (err) throw err;
      return data;
    },
  });

  const files = useQuery({
    queryKey: ["project-files", projectId],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("project_files")
        .select("id, name, source, status, size_bytes, target_style, storage_path, content, redesigned_content, redesign_error")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (err) throw err;
      return data;
    },
  });

  const chat = useQuery({
    queryKey: ["redesign-chats", projectId],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("redesign_chats")
        .select("id, role, content, file_name, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (err) throw err;
      return data;
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.data?.length]);

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["redesign-chats", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["project-files", projectId] }),
    ]);
  };

  const doneCount = (files.data ?? []).filter((f) => f.redesigned_content).length;

  const uploadFiles = async (list: FileList | null) => {
    if (!list || !user) return;
    setUploadError(null);
    setArchiveNotice(null);
    setUploading(true);
    try {
      const result = await uploadFileList({ list, userId: user.id, projectId, targetStyle: null });
      if (result.archiveNotice) setArchiveNotice(result.archiveNotice);
      if (result.error) setUploadError(result.error);
      await queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
      if (fileInput.current) fileInput.current.value = "";
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    const message = input.trim();
    if (!message || sending || !files.data) return;
    setInput("");
    setChatError(null);
    setSending(true);
    try {
      const targets =
        activeFileId === ALL_FILES ? files.data : files.data.filter((f) => f.id === activeFileId);
      if (targets.length === 0) {
        setChatError("Upload a file first.");
        return;
      }
      for (const file of targets) {
        try {
          await sendChat({ data: { projectId, fileId: file.id, message } });
        } catch {
          // The server already records the failure as a chat message; move on to
          // the next file so one bad file doesn't stop a whole-project instruction.
        }
        await invalidateAll();
      }
    } finally {
      setSending(false);
    }
  };

  const downloadZip = async () => {
    setZipping(true);
    setChatError(null);
    try {
      await downloadProjectZip({ projectName: project.data?.name ?? "project", files: files.data ?? [] });
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Could not build the ZIP");
    } finally {
      setZipping(false);
    }
  };

  const activeFileLabel = useMemo(() => {
    if (activeFileId === ALL_FILES) return "every file";
    return files.data?.find((f) => f.id === activeFileId)?.name ?? "that file";
  }, [activeFileId, files.data]);

  if (loading || !user || project.isLoading) {
    return (
      <main>
        <Section last>
          <p className="text-ink-soft">Loading…</p>
        </Section>
      </main>
    );
  }

  if (!project.data) {
    return (
      <main>
        <Section last>
          <p className="text-ink-soft">
            That project isn't available.{" "}
            <Link to="/projects" className="underline">
              Back to your projects
            </Link>
          </p>
        </Section>
      </main>
    );
  }

  return (
    <main>
      <Section last>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/projects/$projectId"
              params={{ projectId }}
              className="mb-2 inline-flex items-center gap-1.5 text-[13.5px] text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {project.data.name}
            </Link>
            <SectionHeading label="Rezyn Chat" title="Redesign it by describing what you want." />
          </div>
          <button
            type="button"
            onClick={() => void downloadZip()}
            disabled={zipping || doneCount === 0}
            className="glass inline-flex items-center gap-2 px-[20px] py-[11px] text-[14px] font-medium text-foreground transition-colors hover:text-revision disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {zipping ? "Packing…" : `Download master zip${doneCount ? ` (${doneCount})` : ""}`}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Files + upload */}
          <Reveal>
            <div className="glass flex h-full flex-col gap-5 p-5">
              <div className="dropzone p-6!">
                <UploadCloud className="h-5 w-5 text-muted-foreground" aria-hidden />
                <p className="text-[13.5px]">{uploading ? "Uploading…" : "Add files or a .zip"}</p>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  onChange={(e) => void uploadFiles(e.target.files)}
                  aria-label="Upload files or a .zip archive"
                />
              </div>
              {archiveNotice ? <p className="text-[12.5px] text-revision">{archiveNotice}</p> : null}
              {uploadError ? <p className="text-[12.5px] text-destructive">{uploadError}</p> : null}

              <div>
                <label htmlFor="chat-target" className="mb-[6px] block text-sm text-muted-foreground">
                  Talking about
                </label>
                <select
                  id="chat-target"
                  value={activeFileId}
                  onChange={(e) => setActiveFileId(e.target.value)}
                  className="field"
                >
                  <option value={ALL_FILES}>All files ({files.data?.length ?? 0})</option>
                  {files.data?.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="text-sm text-muted-foreground">
                  {(files.data?.length ?? 0) === 0
                    ? "No files yet."
                    : `${doneCount} of ${files.data?.length} touched by chat so far.`}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Chat thread */}
          <Reveal delay={0.08}>
            <div className="glass flex h-[560px] flex-col p-0">
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-6">
                {(chat.data?.length ?? 0) === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                    <Sparkles className="h-6 w-6" />
                    <p className="max-w-[320px] text-[14.5px]">
                      Upload a file, then say something like "make the hero bolder and warmer"
                      or "tighten up the spacing everywhere."
                    </p>
                  </div>
                ) : (
                  chat.data?.map((msg) => (
                    <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
                      <div
                        className={
                          msg.role === "user"
                            ? "max-w-[75%] bg-revision px-4 py-[10px] text-[14.5px] text-primary-foreground"
                            : "glass max-w-[75%] px-4 py-[10px] text-[14.5px]"
                        }
                      >
                        {msg.file_name ? (
                          <div
                            className={
                              msg.role === "user"
                                ? "mb-1 text-[11px] tracking-[0.08em] text-primary-foreground/70 uppercase"
                                : "mb-1 text-[11px] tracking-[0.08em] text-revision uppercase"
                            }
                          >
                            {msg.file_name}
                          </div>
                        ) : null}
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {sending ? (
                  <div className="flex justify-start">
                    <div className="glass flex items-center gap-2 px-4 py-[10px] text-[14px] text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      Working on {activeFileLabel}…
                    </div>
                  </div>
                ) : null}
              </div>

              {chatError ? (
                <p className="border-t border-border px-6 py-2 text-[13px] text-destructive">{chatError}</p>
              ) : null}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend();
                }}
                className="flex gap-3 border-t border-border p-4"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Describe a change for ${activeFileLabel}…`}
                  disabled={sending}
                  className="field flex-1"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="glow-aurora inline-flex items-center gap-2 bg-revision px-5 text-[14px] font-semibold text-primary-foreground disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </Section>
    </main>
  );
}
