import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  CircleDashed,
  Download,
  FileCode2,
  Send,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Reveal } from "@/components/studio/motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadFileList } from "@/lib/upload-files";
import { downloadProjectZip } from "@/lib/download-zip";
import { sendChatMessage } from "@/lib/chat-redesign.functions";
import "../chat-agent.css";

export const Route = createFileRoute("/projects/$projectId/chat")({
  head: () => ({
    meta: [
      { title: "Rezyn Chat — conversational interface transformation" },
      {
        name: "description",
        content: "Describe interface changes in plain language and transform project files conversationally.",
      },
    ],
  }),
  component: ChatRedesignPage,
});

function errorMessage(err: unknown): string | null {
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
    return err.message;
  }
  return null;
}

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
  const [currentRunFile, setCurrentRunFile] = useState<string | null>(null);
  const [runProgress, setRunProgress] = useState(0);
  const [runTotal, setRunTotal] = useState(0);

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
    refetchInterval: sending ? 900 : false,
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("project_files")
        .select(
          "id, name, source, status, size_bytes, target_style, storage_path, content, redesigned_content, redesign_error",
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (err) throw err;
      return data;
    },
  });

  const chat = useQuery({
    queryKey: ["redesign-chats", projectId],
    enabled: Boolean(user),
    refetchInterval: sending ? 750 : false,
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
    if (!user) return;

    const channel = supabase
      .channel(`rezyn-chat-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "redesign_chats",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["redesign-chats", projectId] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "project_files",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [projectId, queryClient, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.data?.length, sending]);

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["redesign-chats", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["project-files", projectId] }),
    ]);
  };

  const doneCount = (files.data ?? []).filter((file) => file.redesigned_content).length;

  const latestAgentEvent = useMemo(() => {
    const messages = chat.data ?? [];
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index]?.role === "status") return messages[index];
    }
    return null;
  }, [chat.data]);

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

    const targets =
      activeFileId === ALL_FILES
        ? files.data
        : files.data.filter((file) => file.id === activeFileId);

    if (targets.length === 0) {
      setChatError("Upload a file first.");
      return;
    }

    setInput("");
    setChatError(null);
    setSending(true);
    setRunProgress(0);
    setRunTotal(targets.length);

    const failures: string[] = [];

    try {
      for (let index = 0; index < targets.length; index += 1) {
        const file = targets[index];
        setCurrentRunFile(file.name);
        try {
          await sendChat({ data: { projectId, fileId: file.id, message } });
        } catch (err) {
          failures.push(
            `${file.name}: ${err instanceof Error ? err.message : "that edit failed"}`,
          );
        }
        setRunProgress(index + 1);
        await invalidateAll();
      }

      if (failures.length > 0) {
        setChatError(
          failures.length === 1
            ? failures[0]
            : `${failures.length} files could not be updated. ${failures.join(" · ")}`,
        );
      }
    } finally {
      setCurrentRunFile(null);
      setSending(false);
      await invalidateAll();
    }
  };

  const downloadZip = async () => {
    setZipping(true);
    setChatError(null);
    try {
      await downloadProjectZip({
        projectName: project.data?.name ?? "project",
        files: files.data ?? [],
      });
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Could not build the ZIP");
    } finally {
      setZipping(false);
    }
  };

  const activeFileLabel = useMemo(() => {
    if (activeFileId === ALL_FILES) return "every file";
    return files.data?.find((file) => file.id === activeFileId)?.name ?? "that file";
  }, [activeFileId, files.data]);

  if (loading || !user || project.isLoading) {
    return (
      <main className="system-state">
        <div className="system-state__card">
          <span className="eyebrow">Opening Rezyn Chat</span>
          <h1>Connecting the conversation to your files.</h1>
        </div>
      </main>
    );
  }

  if (!project.data) {
    return (
      <main className="system-state">
        <div className="system-state__card">
          <span className="eyebrow">Project unavailable</span>
          <h1>This conversation has no accessible project.</h1>
          <Link to="/projects" className="button-secondary">
            Back to workspace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20 pt-[128px] sm:pt-[148px]">
      <div className="wrap">
        <Reveal>
          <header className="mb-8 grid grid-cols-1 gap-8 border-b border-border pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <Link
                to="/projects/$projectId"
                params={{ projectId }}
                className="mb-6 inline-flex items-center gap-2 text-[12px] text-muted-foreground no-underline transition-colors hover:text-revision"
              >
                <ArrowLeft className="h-4 w-4" /> {project.data.name}
              </Link>
              <span className="eyebrow block">Conversational transformation</span>
              <h1 className="mb-0 mt-5 max-w-[11ch] text-[clamp(52px,7vw,94px)] leading-[0.86]">
                Describe the next version.
              </h1>
            </div>
            <button
              type="button"
              onClick={() => void downloadZip()}
              disabled={zipping || doneCount === 0}
              className="button-secondary disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {zipping ? "Packing…" : `Export master ZIP${doneCount ? ` / ${doneCount}` : ""}`}
            </button>
          </header>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
          <Reveal>
            <aside className="glass flex min-h-[680px] flex-col p-5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <span className="eyebrow">Source index</span>
                  <h2 className="mb-0 mt-3 text-[28px] leading-none">
                    Files / {files.data?.length ?? 0}
                  </h2>
                </div>
                <FileCode2 className="h-5 w-5 text-revision" />
              </div>

              <div className="dropzone min-h-[130px] p-5!">
                <UploadCloud className="h-5 w-5 text-revision" aria-hidden />
                <p className="mb-0 text-[13px]">
                  {uploading ? "Reading source…" : "Add files or ZIP"}
                </p>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  onChange={(event) => void uploadFiles(event.target.files)}
                  aria-label="Upload files or a zip archive"
                />
              </div>
              {archiveNotice ? (
                <p className="mb-0 mt-2 text-[11px] text-revision">{archiveNotice}</p>
              ) : null}
              {uploadError ? (
                <p className="mb-0 mt-2 text-[11px] text-destructive">{uploadError}</p>
              ) : null}

              <div className="mt-6">
                <label
                  htmlFor="chat-target"
                  className="mb-2 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground uppercase"
                >
                  Conversation target
                </label>
                <select
                  id="chat-target"
                  value={activeFileId}
                  onChange={(event) => setActiveFileId(event.target.value)}
                  className="field"
                  disabled={sending}
                >
                  <option value={ALL_FILES}>All files ({files.data?.length ?? 0})</option>
                  {files.data?.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex-1 space-y-2 overflow-y-auto">
                {files.data?.map((file) => {
                  const active = activeFileId === file.id;
                  const isRunning = file.status === "redesigning";
                  const isFailed = file.status === "failed";
                  const isDone = Boolean(file.redesigned_content) && !isRunning && !isFailed;
                  const statusClass = isRunning
                    ? "is-running"
                    : isFailed
                      ? "is-failed"
                      : isDone
                        ? "is-done"
                        : "";
                  const statusLabel = isRunning
                    ? "Working"
                    : isFailed
                      ? "Failed"
                      : isDone
                        ? "Transformed"
                        : "Source";

                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => setActiveFileId(file.id)}
                      disabled={sending}
                      className={`flex w-full items-center gap-3 border px-3 py-3 text-left transition-colors disabled:cursor-not-allowed ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-transparent hover:border-foreground"
                      }`}
                    >
                      <span className={`agent-file-status ${statusClass}`}>
                        <span className="agent-file-status__dot" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-[12px] ${active ? "text-background" : "text-foreground"}`}
                        >
                          {file.name}
                        </span>
                        <span
                          className={`agent-file-status ${statusClass} ${active ? "text-background/65" : "text-muted-foreground"}`}
                        >
                          {statusLabel}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-border pt-4 font-mono text-[9px] leading-5 tracking-[0.06em] text-muted-foreground">
                {files.data?.length
                  ? `${doneCount}/${files.data.length} files have transformed output.`
                  : "No files attached yet."}
              </div>
            </aside>
          </Reveal>

          <Reveal delay={0.06}>
            <section className="glass flex min-h-[680px] flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center border border-foreground bg-foreground text-background">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[13px] font-medium">Rezyn transformation agent</div>
                    <div className="font-mono text-[8px] tracking-[0.1em] text-muted-foreground uppercase">
                      Target / {activeFileLabel}
                    </div>
                  </div>
                </div>
                <span className={sending ? "signal-dot" : "h-[7px] w-[7px] rounded-full bg-revision/50"} />
              </div>

              {sending ? (
                <div className="agent-livebar" aria-live="polite">
                  <span className="agent-livebar__state">
                    <span className="agent-livebar__pulse" /> Agent live
                  </span>
                  <strong>
                    {latestAgentEvent?.content ??
                      (currentRunFile
                        ? `Starting ${currentRunFile}…`
                        : "Preparing transformation…")}
                  </strong>
                  <span className="agent-livebar__count">
                    {Math.min(runProgress + (currentRunFile ? 1 : 0), runTotal)} / {runTotal}
                  </span>
                </div>
              ) : null}

              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-7">
                {chat.isError ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <div className="max-w-[460px]">
                      <span className="eyebrow">Conversation unavailable</span>
                      <p className="mt-4 text-[14px] leading-7 text-destructive">
                        Couldn't load the conversation
                        {errorMessage(chat.error) ? `: ${errorMessage(chat.error)}` : "."} Apply the
                        redesign chat migrations if this environment has not been migrated yet.
                      </p>
                    </div>
                  </div>
                ) : (chat.data?.length ?? 0) === 0 ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <div className="max-w-[460px]">
                      <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-foreground bg-[var(--revision-bg)] text-foreground">
                        <Sparkles className="h-6 w-6" />
                      </span>
                      <h2 className="text-[32px] leading-none">Tell the interface what to become.</h2>
                      <p className="mt-4 text-[14px] leading-7 text-ink-soft">
                        Try “make the hero more cinematic”, “reduce dashboard density”, or “rebuild the navigation as a floating command bar”.
                      </p>
                    </div>
                  </div>
                ) : (
                  chat.data?.map((message) => {
                    if (message.role === "status") {
                      const isError = message.content.startsWith("Stopped:");
                      const isDone = message.content.startsWith("Saved the updated file");
                      return (
                        <div
                          key={message.id}
                          className={`agent-event${isError ? " is-error" : ""}${isDone ? " is-done" : ""}`}
                        >
                          <span className="agent-event__icon">
                            {isDone ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <CircleDashed className={`h-3.5 w-3.5 ${sending ? "animate-spin" : ""}`} />
                            )}
                          </span>
                          <span className="agent-event__copy">{message.content}</span>
                          <span className="agent-event__file">{message.file_name ?? "Agent"}</span>
                        </div>
                      );
                    }

                    const isUser = message.role === "user";
                    return (
                      <div key={message.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
                        <div
                          className={`max-w-[82%] border px-4 py-3 text-[14px] leading-6 sm:max-w-[72%] ${
                            isUser
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-white/25 text-ink-soft"
                          }`}
                        >
                          {message.file_name ? (
                            <div
                              className={`mb-1 font-mono text-[8px] tracking-[0.1em] uppercase ${
                                isUser ? "text-background/60" : "text-revision"
                              }`}
                            >
                              {message.file_name}
                            </div>
                          ) : null}
                          {message.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {chatError ? (
                <p className="m-0 border-t border-border px-5 py-3 text-[12px] text-destructive sm:px-6">
                  {chatError}
                </p>
              ) : null}

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSend();
                }}
                className="border-t border-border p-4 sm:p-5"
              >
                <div className="agent-chat-input">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    rows={2}
                    placeholder={`Describe a change for ${activeFileLabel}…`}
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="button-primary min-w-[50px] px-4 disabled:opacity-40"
                    aria-label="Send transformation instruction"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4 font-mono text-[8px] tracking-[0.06em] text-muted-foreground uppercase">
                  <span>Enter to send · Shift + Enter for new line</span>
                  <span>Edits build on the latest saved source</span>
                </div>
              </form>
            </section>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
