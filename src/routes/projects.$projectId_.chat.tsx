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
        content: "Discuss, plan and redesign project interfaces through a conversation-first AI design copilot.",
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
    setCurrentRunFile(null);
    setRunProgress(0);
    setRunTotal(1);

    const failures: string[] = [];
    let confirmedRedesign = false;

    try {
      for (let index = 0; index < targets.length; index += 1) {
        const file = targets[index];
        if (confirmedRedesign) setCurrentRunFile(file.name);

        try {
          const result = await sendChat({
            data: {
              projectId,
              fileId: file.id,
              message,
              skipIntent: confirmedRedesign,
              recordUserMessage: index === 0,
            },
          });

          if (result.mode === "conversation") {
            setRunProgress(1);
            setRunTotal(1);
            await invalidateAll();
            break;
          }

          confirmedRedesign = true;
          setRunTotal(targets.length);
          setCurrentRunFile(file.name);
          setRunProgress(index + 1);
        } catch (err) {
          failures.push(
            `${file.name}: ${err instanceof Error ? err.message : "that request failed"}`,
          );
        }

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
    <main className="pb-12 pt-7 sm:pb-16 sm:pt-9">
      <div className="wrap">
        <Reveal>
          <header className="mb-5 grid grid-cols-1 gap-5 border-b border-border pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <Link
                to="/projects/$projectId"
                params={{ projectId }}
                className="mb-4 inline-flex items-center gap-2 text-[12px] text-muted-foreground no-underline transition-colors hover:text-revision"
              >
                <ArrowLeft className="h-4 w-4" /> {project.data.name}
              </Link>
              <span className="eyebrow block">Conversational prompt redesign</span>
              <h1 className="mb-0 mt-3 max-w-[13ch] text-[clamp(40px,5.5vw,72px)] leading-[0.88]">
                Talk it through. Change it when ready.
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

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
          <Reveal>
            <aside className="glass flex min-h-[520px] flex-col p-5 xl:h-[calc(100dvh-245px)] xl:min-h-[560px] xl:max-h-[760px]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <span className="eyebrow">Source index</span>
                  <h2 className="mb-0 mt-3 text-[28px] leading-none">
                    Files / {files.data?.length ?? 0}
                  </h2>
                </div>
                <FileCode2 className="h-5 w-5 text-revision" />
              </div>

              <div className="dropzone min-h-[112px] p-5!">
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

              <div className="mt-5">
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

              <div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto">
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

              <div className="mt-4 border-t border-border pt-4 font-mono text-[9px] leading-5 tracking-[0.06em] text-muted-foreground">
                {files.data?.length
                  ? `${doneCount}/${files.data.length} files have transformed output.`
                  : "No files attached yet."}
              </div>
            </aside>
          </Reveal>

          <Reveal delay={0.06}>
            <section className="glass flex min-h-[520px] flex-col overflow-hidden xl:h-[calc(100dvh-245px)] xl:min-h-[560px] xl:max-h-[760px]">
              <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center border border-foreground bg-foreground text-background">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[13px] font-medium">Rezyn design copilot</div>
                    <div className="font-mono text-[8px] tracking-[0.1em] text-muted-foreground uppercase">
                      Conversation target / {activeFileLabel}
                    </div>
                  </div>
                </div>
                <span className={sending ? "signal-dot" : "h-[7px] w-[7px] rounded-full bg-revision/50"} />
              </div>

              {sending ? (
                <div className="agent-livebar" aria-live="polite">
                  <span className="agent-livebar__state">
                    <span className="agent-livebar__pulse" /> Rezyn thinking
                  </span>
                  <strong>
                    {latestAgentEvent?.content ??
                      (currentRunFile
                        ? `Working on ${currentRunFile}…`
                        : "Understanding your message before deciding whether anything should change…")}
                  </strong>
                  <span className="agent-livebar__count">
                    {runProgress} / {runTotal}
                  </span>
                </div>
              ) : null}

              <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-7">
                {chat.isError ? (
                  <div className="flex min-h-full items-center justify-center text-center">
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
                  <div className="flex min-h-full items-start justify-center pt-10 text-center sm:pt-14">
                    <div className="max-w-[500px]">
                      <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-foreground bg-[var(--revision-bg)] text-foreground">
                        <Sparkles className="h-5 w-5" />
                      </span>
                      <h2 className="text-[30px] leading-none">Chat first. Redesign when you say so.</h2>
                      <p className="mt-4 text-[14px] leading-7 text-ink-soft">
                        Say hello, ask questions, brainstorm, compare design directions, or request feedback. Rezyn only edits files when you clearly ask it to make a change.
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
                              : "border-border bg-background/45 text-foreground"
                          }`}
                        >
                          {message.content}
                          {message.file_name ? (
                            <span
                              className={`mt-2 block font-mono text-[8px] tracking-[0.08em] uppercase ${
                                isUser ? "text-background/55" : "text-muted-foreground"
                              }`}
                            >
                              {message.file_name}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-border bg-background/30 p-4 sm:p-5">
                {chatError ? (
                  <p className="mb-3 mt-0 text-[12px] text-destructive">{chatError}</p>
                ) : null}
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
                    disabled={sending}
                    placeholder={`Chat, ask a question, or describe a change for ${activeFileLabel}…`}
                    rows={2}
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={sending || !input.trim() || (files.data?.length ?? 0) === 0}
                    className="button-primary h-[54px] w-[54px] shrink-0 p-0! disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Send chat message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[8px] tracking-[0.08em] text-muted-foreground uppercase">
                  <span>Enter to send · Shift + Enter for a new line</span>
                  <span>
                    {sending
                      ? currentRunFile
                        ? `Editing ${currentRunFile}`
                        : "Understanding intent"
                      : `Chat freely · explicit edit requests modify ${activeFileLabel}`}
                  </span>
                </div>
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </main>
  );
}