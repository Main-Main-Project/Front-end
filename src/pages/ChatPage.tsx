import { Fragment, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowDown, Paperclip, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { createSession, uploadDocument } from "@/lib/chatApi";
import { useChatStore } from "@/stores/chatStore";
import { useDocumentStore } from "@/stores/documentStore";
import { showToast } from "@/stores/notificationStore";
import { getAttachmentMeta } from "@/styles/attachmentMeta";

function formatChatTime(value: string) {
  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// assistant 답변을 한 글자씩 보여 주는 타이핑 애니메이션 컴포넌트
function TypingText({
  text,
  shouldAnimate,
  speed = 20,
  onDone,
}: {
  text: string;
  shouldAnimate: boolean;
  speed?: number;
  onDone?: () => void;
}) {
  const [visibleText, setVisibleText] = useState(shouldAnimate ? "" : text);

  useEffect(() => {
    if (!shouldAnimate) {
      setVisibleText(text);
      return;
    }

    setVisibleText("");

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
        onDone?.();
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [text, shouldAnimate, speed, onDone]);

  const isTyping = shouldAnimate && visibleText.length < text.length;

  return (
    <p className="whitespace-pre-wrap">
      {visibleText}
      {isTyping ? <span className="animate-pulse">|</span> : null}
    </p>
  );
}

export function ChatPage() {
  const {
    sessions,
    activeSessionId,
    draft,
    setDraft,
    sendMessage,
    loadSessions,
    selectSession,
    messagesBySession,
    pendingNewChatMessages,
    sendingBySession,
    connectSocket,
    registerSession,
    touchSession,
    appendLocalMessage,
  } = useChatStore();

  const addUploadedDocument = useDocumentStore((s) => s.addUploadedDocument);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const removeMessage = useChatStore((s) => s.removeMessage);
  const loadDocuments = useDocumentStore((s) => s.loadDocuments);
  const clearDocuments = useDocumentStore((s) => s.clearDocuments);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emptyComposerRef = useRef<HTMLTextAreaElement | null>(null);
  const activeComposerRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const animatedMessageIdsRef = useRef(new Set<string>());
  const wasNearBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isRestoringSessionScroll, setIsRestoringSessionScroll] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const AUTO_SCROLL_THRESHOLD = 120;

  const MAX_TEXTAREA_HEIGHT = 200;

  // 입력창 높이를 내용에 맞춰 자동으로 조절하되 최대 높이는 제한한다.
  const resizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;

    textarea.style.height = "0px";

    const nextHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  };
  useEffect(() => {
    resizeTextarea(emptyComposerRef.current);
    resizeTextarea(activeComposerRef.current);
  }, [draft, activeSessionId]);

  // 입력 중이던 질문이 비워지면 문서 드래그 차단 상태도 함께 해제한다.
  useEffect(() => {
    if (draft.trim().length === 0) {
      setDragBlocked(false);
    }
  }, [draft]);

  useEffect(() => {
    setPendingFiles([]);
  }, [activeSessionId]);

  // 활성 세션이 바뀌면 해당 세션의 업로드 문서 목록을 다시 불러온다.
  useEffect(() => {
    if (!activeSessionId) {
      clearDocuments();
      return;
    }

    void loadDocuments(activeSessionId);
  }, [activeSessionId, loadDocuments, clearDocuments]);

  // 전송 전 대기 중인 첨부 문서 목록을 입력창 위에 카드 형태로 보여 준다.
  const renderAttachedDocumentCards = () => {
    if (pendingFiles.length === 0) return null;

    return (
      <div className="mb-3 overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div className="flex min-w-max gap-2 pr-1">
          {pendingFiles.map((file) => {
            const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
            const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
            const fileMeta = getAttachmentMeta(extension);

            return (
              <div
                key={fileKey}
                className={cn(
                  "flex w-[220px] shrink-0 items-center gap-2 rounded-xl border px-2.5 py-2 transition",
                  isUploading
                    ? "border-border bg-muted/60 opacity-80"
                    : "border-border bg-background"
                )}
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg text-white",
                    fileMeta.bgClass
                  )}
                >
                  <Paperclip className="size-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold">{file.name}</p>
                  <p className="text-[9px] text-mutedForeground">
                    {isUploading ? "업로드 중..." : fileMeta.label}
                  </p>
                </div>

                {!isUploading && (
                  <button
                    type="button"
                    className="shrink-0 rounded-full p-0.5 text-mutedForeground hover:bg-muted hover:text-foreground"
                    onClick={() => {
                      setPendingFiles((prev) =>
                        prev.filter(
                          (item) =>
                            !(
                              item.name === file.name &&
                              item.size === file.size &&
                              item.lastModified === file.lastModified
                            )
                        )
                      );
                    }}
                    aria-label="첨부 문서 제거"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 메시지 영역의 실제 스크롤 viewport를 찾아 자동 스크롤 여부를 제어한다.
  const getScrollViewport = () =>
    scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;

  const isNearBottom = () => {
    const viewport = getScrollViewport();
    if (!viewport) return true;

    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

    return distanceFromBottom <= AUTO_SCROLL_THRESHOLD;
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  const handleMessagesScroll = () => {
    const nearBottom = isNearBottom();
    wasNearBottomRef.current = nearBottom;
    setShowScrollToBottom(!nearBottom);
  };
  
  
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<File[]>([]);
  const [dragBlocked, setDragBlocked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const isSending = activeSessionId
    ? (sendingBySession[activeSessionId] ?? false)
    : pendingNewChatMessages.some((message) => message.role === "user" && message.pending);

  useEffect(() => {
    if (isSending || isUploading) {
      setIsDragging(false);
      setDraggedFiles([]);
    }
  }, [isSending, isUploading]);
  
  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!sessionId) return;
    if (activeSessionId === sessionId) return;

    void selectSession(sessionId);
  }, [sessionId, activeSessionId, selectSession]);

  useEffect(() => {
    if (!activeSessionId || sessionId) return;

    navigate(`/chat/${activeSessionId}`, { replace: true });
  }, [activeSessionId, sessionId, navigate]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSessionId
    ? (messagesBySession[activeSessionId] ?? [])
    : pendingNewChatMessages;

  // 세션 전환 시 이전 스크롤 상태가 섞이지 않도록 관련 값을 초기화한다.
  useEffect(() => {
    prevMessageCountRef.current = 0;
    wasNearBottomRef.current = true;
    setShowScrollToBottom(false);
    setIsRestoringSessionScroll(true);
  }, [activeSessionId]);

  useEffect(() => {
    const viewport = getScrollViewport();
    if (!viewport) return;

    const nearBottom = isNearBottom();
    wasNearBottomRef.current = nearBottom;
    setShowScrollToBottom(!nearBottom);

    viewport.addEventListener("scroll", handleMessagesScroll);

    return () => {
      viewport.removeEventListener("scroll", handleMessagesScroll);
    };
  }, [activeSessionId]);

  // 새 메시지가 추가되면 사용자가 하단에 있을 때만 자동으로 맨 아래로 이동한다.
  useEffect(() => {
    if (messages.length === 0) {
      prevMessageCountRef.current = 0;
      return;
    }

    const isInitialLoad =
      prevMessageCountRef.current === 0 && messages.length > 0;

    const hasNewMessage =
      messages.length > prevMessageCountRef.current;

    if (isInitialLoad) {
      requestAnimationFrame(() => {
        scrollToBottom("auto");
        setShowScrollToBottom(false);
        setIsRestoringSessionScroll(false);
      });
      wasNearBottomRef.current = true;
    } else if (hasNewMessage && wasNearBottomRef.current) {
      scrollToBottom("smooth");
    }

    prevMessageCountRef.current = messages.length;
  }, [messages, activeSessionId]);

  useEffect(() => {
    if (isSending && wasNearBottomRef.current) {
      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });
    }
  }, [isSending]);

  // 숨겨진 파일 입력창을 열어 문서 첨부를 시작한다.
  const triggerUpload = () => {
    if (isSending || isUploading || draft.trim().length > 0) return;
    fileInputRef.current?.click();
  };

  const MAX_PENDING_FILES = 3;

  const handleFiles = (files: FileList | null) => {
    if (isSending || isUploading) return;
    if (draft.trim().length > 0) {
      showToast({
        title: "동시 첨부 불가",
        description: "질문이 입력된 상태에서는 문서를 첨부할 수 없습니다.",
        tone: "error",
      });
      return;
    }
    if (!files || files.length === 0) return;

    const nextFiles = Array.from(files);

    setPendingFiles((prev) => {
      const merged = [...prev];

      for (const file of nextFiles) {
        const exists = merged.some(
          (item) =>
            item.name === file.name &&
            item.size === file.size &&
            item.lastModified === file.lastModified
        );

        if (!exists && merged.length >= MAX_PENDING_FILES) {
          showToast({
            title: "첨부 제한",
            description: "문서는 최대 3개까지 첨부할 수 있습니다.",
            tone: "error",
          });
          break;
        }

        if (!exists) {
          merged.push(file);
        }
      }

      return merged.slice(0, MAX_PENDING_FILES);
    });
  };

  // 질문 입력 상태에서는 문서 드래그를 막고, 그 외에는 드롭 업로드를 허용한다.
  const hasFiles = (e: React.DragEvent<HTMLDivElement>) => {
    return Array.from(e.dataTransfer.types).includes("Files");
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isSending || isUploading) return;
    if (!hasFiles(e)) return;

    const hasDraftText = draft.trim().length > 0;

    setDraggedFiles(Array.from(e.dataTransfer.files ?? []));

    if (hasDraftText) {
      setDragBlocked(true);
      setIsDragging(false);
      return;
    }

    setDragBlocked(false);
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isSending || isUploading) return;
    if (!hasFiles(e)) return;

    const hasDraftText = draft.trim().length > 0;

    setDraggedFiles(Array.from(e.dataTransfer.files ?? []));

    if (hasDraftText) {
      e.dataTransfer.dropEffect = "none";
      setDragBlocked(true);
      setIsDragging(false);
      return;
    }

    e.dataTransfer.dropEffect = "copy";
    setDragBlocked(false);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDragging(false);
      setDragBlocked(false);
      setDraggedFiles([]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isSending || isUploading) return;
    if (!hasFiles(e)) return;

    const hasDraftText = draft.trim().length > 0;

    setIsDragging(false);
    setDragBlocked(false);
    setDraggedFiles([]);

    if (hasDraftText) {
      showToast({
        title: "동시 첨부 불가",
        description: "질문이 입력된 상태에서는 문서를 첨부할 수 없습니다.",
        tone: "error",
      });
      return;
    }

    handleFiles(e.dataTransfer.files);
  };

  // 텍스트 질문 전송과 문서 업로드를 한 곳에서 처리한다.
  // 문서와 질문은 동시에 전송하지 않도록 분기한다.
  const handleSendMessage = async () => {
    if (isSending || isUploading) return;

    const text = draft.trim();
    const hasFiles = pendingFiles.length > 0;
    const hasText = text.length > 0;

    if (!hasText && !hasFiles) return;

    if (hasFiles && hasText) {
      showToast({
        title: "동시 전송 불가",
        description: "문서와 질문은 함께 전송할 수 없습니다. 문서만 업로드하거나 질문만 입력해 주세요.",
        tone: "error",
      });
      return;
    }

    wasNearBottomRef.current = isNearBottom();

    try {
      if (hasFiles) {
        let sessionId = activeSessionId;
        const filesToUpload = [...pendingFiles];

        setPendingFiles([]);
        setIsUploading(true);

        if (!sessionId) {
          const session = await createSession();

          registerSession({
            id: session.session_id,
            title: "__uploading__",
            updatedAt: session.created_at,
          });

          sessionId = session.session_id;
          await connectSocket(sessionId);
        }

        for (const file of filesToUpload) {
          const now = new Date().toISOString();
          const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
          const documentMessageId = crypto.randomUUID();
          const summaryMessageId = crypto.randomUUID();

          appendLocalMessage(sessionId, {
            id: documentMessageId,
            role: "user",
            content: "",
            createdAt: now,
            attachments: [
              {
                name: file.name,
                extension,
              },
            ],
          });

          appendLocalMessage(sessionId, {
            id: summaryMessageId,
            role: "assistant",
            content: "문서 요약 중",
            createdAt: now,
            pending: true,
          });

          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

          try {
            const uploaded = await uploadDocument(sessionId, file);

            addUploadedDocument(uploaded);

            updateMessage(sessionId, summaryMessageId, {
              content: uploaded.summary?.trim() || "요약 결과가 없습니다.",
              pending: false,
              animateOnMount: true,
            });
          } catch (error) {
            removeMessage(sessionId, documentMessageId);
            removeMessage(sessionId, summaryMessageId);
            throw error;
          }
        }

        await loadSessions();

        showToast({
          title: "문서 업로드 완료",
          description: "문서 업로드가 완료되었습니다.",
          tone: "success",
        });
        return;
      }

      if (hasText) {
        setDraft("");

        if (activeSessionId) {
          appendLocalMessage(activeSessionId, {
            id: crypto.randomUUID(),
            role: "user",
            content: text,
            createdAt: new Date().toISOString(),
            pending: true,
          });
        }

        await sendMessage(text);
      }
    } catch (error) {
      showToast({
        title: "전송 실패",
        description:
          error instanceof Error ? error.message : "문서 또는 메시지 전송 중 오류가 발생했습니다.",
        tone: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("relative flex h-full w-full flex-col transition-colors",
        isDragging && "bg-primary/5"
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {(isDragging || dragBlocked) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 flex w-full max-w-md flex-col items-center rounded-3xl border border-white/10 bg-neutral-900 px-10 py-12 text-center shadow-2xl">
            <div
              className={cn(
                "mb-5 flex size-20 items-center justify-center rounded-3xl",
                dragBlocked ? "bg-red-500/15" : "bg-primary/15"
              )}
            >
              <i
                className={cn(
                  "icofont-file-document text-6xl",
                  dragBlocked ? "text-red-400" : "text-primary"
                )}
              />
            </div>

            <h3 className="text-3xl font-semibold text-white">
              {dragBlocked ? "문서와 질문은 함께 보낼 수 없어요" : "무엇이든 추가하세요"}
            </h3>
            <p className="mt-3 text-base text-white/70">
              {dragBlocked
                ? "질문 내용을 지우고 문서를 업로드하거나, 문서 첨부를 해제한 뒤 질문을 전송해 주세요."
                : "대화에 추가하려면 여기에 파일을 드롭하세요"}
            </p>

            {draggedFiles.length > 0 && (
              <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <p className="truncate text-sm font-medium text-white">
                  {draggedFiles[0].name}
                </p>
                {draggedFiles.length > 1 && (
                  <p className="mt-1 text-xs text-white/60">
                    외 {draggedFiles.length - 1}개 파일
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!activeSession && messages.length === 0 ? (
        // 활성 세션이 없고 메시지도 없으면 첫 질문 입력용 빈 상태 화면을 보여 준다.
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <h2 className="mb-6 text-center text-3xl font-semibold">무엇을 도와드릴까요?</h2>
          <div className="w-full max-w-3xl">
            <div className="rounded-3xl border border-border bg-input p-2">
              {renderAttachedDocumentCards()}
              <Textarea
                ref={emptyComposerRef}
                rows={1}
                value={draft}
                disabled={isSending || isUploading || pendingFiles.length > 0}
                onChange={(e) => {
                  setDraft(e.target.value);
                  resizeTextarea(e.currentTarget);
                }}
                onKeyDown={(e) => {
                  if (isSending || isUploading || pendingFiles.length > 0) {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                    return;
                  }

                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendMessage();
                  }
                }}
                placeholder="문서만 업로드하거나 질문만 입력하세요."
                className="min-h-14 resize-none overflow-hidden border-0 bg-transparent"
              />
              
              <div className="mt-2 flex items-center justify-between">
                <Button onClick={triggerUpload} variant="ghost" size="icon" aria-label="문서 업로드" disabled={isSending || isUploading || draft.trim().length > 0}>
                  <Paperclip className="size-4" />
                </Button>
                <Button onClick={handleSendMessage} disabled={isSending || isUploading}>
                  <SendHorizontal className="mr-2 size-4" />
                  {isSending ? "답변 생성 중" : "전송"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      // 세션이 있으면 메시지 타임라인과 하단 입력창을 함께 렌더링한다.
      ) : (
        <>
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6 md:px-10">
            <div className="mx-auto w-full max-w-4xl space-y-8">
              {messages.map((message, index) => (
                <Fragment key={message.id}>
                  <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[75%] ${
                        message.role === "user"
                          ? "bg-primary text-primaryForeground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <div className="space-y-2">
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="space-y-2">
                            {message.attachments.map((file) => {
                              const meta = getAttachmentMeta(file.extension);

                              return (
                                <div
                                  key={`${message.id}-${file.name}`}
                                  className="flex w-[190px] items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-2.5 py-2"
                                >
                                  <div
                                    className={cn(
                                      "flex size-9 shrink-0 items-center justify-center rounded-lg text-white",
                                      meta.bgClass
                                    )}
                                  >
                                    <Paperclip className="size-3.5" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[12px] font-semibold">{file.name}</p>
                                    <p className="text-[9px] opacity-80">{meta.label}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {/* assistant 메시지가 아직 완성되지 않았으면 로딩 버블을 먼저 보여 준다. */}
                        {message.pending && message.role === "assistant" ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground/80">
                              {message.content || "답변 생성 중"}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="size-2 rounded-full bg-foreground/50 animate-bounce" />
                              <span className="size-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:0.15s]" />
                              <span className="size-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:0.3s]" />
                            </div>
                          </div>
                        ) : message.content ? (
                          // 새로 도착한 assistant 답변만 타이핑 애니메이션으로 출력한다.
                          message.role === "assistant" ? (
                            <TypingText
                              text={message.content}
                              shouldAnimate={Boolean(message.animateOnMount) && !animatedMessageIdsRef.current.has(message.id)
}
                              onDone={() => {
                                animatedMessageIdsRef.current.add(message.id);
                              }}
                            />
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )
                        ) : null}
                      </div>

                      <span className="mt-2 block text-[11px] opacity-70">
                        {formatChatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* 마지막 user 메시지 전송 직후에는 assistant 답변이 오기 전까지 임시 로딩 버블을 보여 준다. */}
                  {message.pending &&
                    message.role === "user" &&
                    index === messages.length - 1 &&
                    isSending && (
                      <div className="mt-3 flex justify-start">
                        <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-3 md:max-w-[75%]">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground/80">답변 생성 중</span>
                            <div className="flex items-center gap-1">
                              <span className="size-2 rounded-full bg-foreground/50 animate-bounce" />
                              <span className="size-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:0.15s]" />
                              <span className="size-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:0.3s]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </Fragment>
              ))}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* 사용자가 위로 스크롤한 경우에만 하단 이동 버튼을 노출한다. */}
          {showScrollToBottom && !isRestoringSessionScroll && (
            <div className="pointer-events-none absolute bottom-44 left-1/2 -translate-x-1/2">
              <Button
                type="button"
                size="icon"
                className="pointer-events-auto rounded-full shadow-lg"
                onClick={() => {
                  scrollToBottom("smooth");
                  setShowScrollToBottom(false);
                }}
                aria-label="맨 아래로 이동"
              >
                <ArrowDown className="size-4" />
              </Button>
            </div>
          )}

          <div className="border-t border-border p-4 md:px-10">
            <div className="mx-auto w-full max-w-4xl rounded-3xl border border-border bg-input p-3">
              {renderAttachedDocumentCards()}
              <Textarea
                ref={activeComposerRef}
                rows={1}
                value={draft}
                disabled={isSending || isUploading || pendingFiles.length > 0}
                onChange={(e) => {
                  setDraft(e.target.value);
                  resizeTextarea(e.currentTarget);
                }}
                onKeyDown={(e) => {
                  if (isSending || isUploading || pendingFiles.length > 0) {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                    return;
                  }

                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendMessage();
                  }
                }}
                placeholder="문서만 업로드하거나 질문만 입력하세요."
                className="min-h-12 resize-none overflow-hidden border-0 bg-transparent"
              />
              <div className="mt-2 flex items-center justify-between">
                <Button onClick={triggerUpload} variant="ghost" size="icon" aria-label="문서 업로드" disabled={isSending || isUploading || draft.trim().length > 0}>
                  <Paperclip className="size-4" />
                </Button>
                <Button onClick={handleSendMessage} disabled={isSending || isUploading}>
                  <SendHorizontal className="mr-2 size-4" />
                  {isSending ? "답변 생성 중" : "전송"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
