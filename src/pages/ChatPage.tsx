import { useEffect, useRef, useState } from "react";
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

function formatChatTime(value: string) {
  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
    isSending,
    connectSocket,
    registerSession,
  } = useChatStore();

  const addUploadedDocument = useDocumentStore((s) => s.addUploadedDocument);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emptyComposerRef = useRef<HTMLTextAreaElement | null>(null);
  const activeComposerRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const wasNearBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isRestoringSessionScroll, setIsRestoringSessionScroll] = useState(false);

  const AUTO_SCROLL_THRESHOLD = 120;

  const MAX_TEXTAREA_HEIGHT = 200;

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
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

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
  }, [activeSessionId, messages.length]);

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

  // 숨겨진 file input을 버튼으로 트리거하기 위한 헬퍼.
  const triggerUpload = () => fileInputRef.current?.click();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);

      let sessionId = activeSessionId;

      if (!sessionId) {
        const session = await createSession();

        registerSession({
          id: session.session_id,
          title: session.title,
          updatedAt: session.created_at,
        });

        sessionId = session.session_id;
        await connectSocket(sessionId);
      }

      for (const file of Array.from(files)) {
        const uploaded = await uploadDocument(sessionId, file);
        addUploadedDocument(uploaded);

        showToast({
          title: "문서 업로드 완료",
          description: `${uploaded.file_name} 문서가 업로드되었습니다.`,
          tone: "success",
        });
      }
    } catch (error) {
      showToast({
        title: "문서 업로드 실패",
        description:
          error instanceof Error ? error.message : "문서 업로드 중 오류가 발생했습니다.",
        tone: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const hasFiles = (e: React.DragEvent<HTMLDivElement>) => {
    return Array.from(e.dataTransfer.types).includes("Files");
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!hasFiles(e)) return;

    setIsDragging(true);
    setDraggedFiles(Array.from(e.dataTransfer.files ?? []));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!hasFiles(e)) return;

    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
    setDraggedFiles(Array.from(e.dataTransfer.files ?? []));
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDragging(false);
      setDraggedFiles([]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!hasFiles(e)) return;

    setIsDragging(false);
    setDraggedFiles([]);
    handleFiles(e.dataTransfer.files);
  };

  const handleSendMessage = async () => {
    wasNearBottomRef.current = isNearBottom();
    await sendMessage();
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
      {isDragging && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 flex w-full max-w-md flex-col items-center rounded-3xl border border-white/10 bg-neutral-900 px-10 py-12 text-center shadow-2xl">
            <div className="mb-5 flex size-20 items-center justify-center rounded-3xl bg-primary/15">
              <i className="icofont-file-document text-6xl text-primary" />
            </div>

            <h3 className="text-3xl font-semibold text-white">무엇이든 추가하세요</h3>
            <p className="mt-3 text-base text-white/70">
              대화에 추가하려면 여기에 파일을 드롭하세요
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
        // 활성 세션이 없으면 "첫 질문" 빈 상태 화면을 보여준다.
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <h2 className="mb-6 text-center text-3xl font-semibold">무엇을 도와드릴까요?</h2>
          <div className="w-full max-w-3xl">
            <div className="rounded-3xl border border-border bg-input p-2">
              <Textarea
                ref={emptyComposerRef}
                rows={1}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  resizeTextarea(e.currentTarget);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendMessage();
                  }
                }}
                placeholder="법률 질문이나 문서 검토 요청을 입력하세요."
                className="min-h-14 resize-none overflow-hidden border-0 bg-transparent"
              />
              
              <div className="mt-2 flex items-center justify-between">
                <Button onClick={triggerUpload} variant="ghost" size="icon" aria-label="문서 업로드" disabled={isUploading}>
                  <Paperclip className="size-4" />
                </Button>
                <Button onClick={handleSendMessage} disabled={isSending || isUploading}>
                  <SendHorizontal className="mr-2 size-4" />
                  전송
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 세션이 있으면 메시지 타임라인 + 하단 컴포저를 렌더링한다.
        <>
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6 md:px-10">
            <div className="mx-auto w-full max-w-4xl space-y-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[75%] ${
                      message.role === "user"
                        ? "bg-primary text-primaryForeground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="mt-2 block text-[11px] opacity-70">
                      {formatChatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

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
              <Textarea
                ref={activeComposerRef}
                rows={1}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  resizeTextarea(e.currentTarget);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendMessage();
                  }
                }}
                placeholder="추가 질문을 입력하세요."
                className="min-h-12 resize-none overflow-hidden border-0 bg-transparent"
              />
              <div className="mt-2 flex items-center justify-between">
                <Button onClick={triggerUpload} variant="ghost" size="icon" aria-label="문서 업로드" disabled={isUploading}>
                  <Paperclip className="size-4" />
                </Button>
                <Button onClick={handleSendMessage} disabled={isSending || isUploading}>
                  <SendHorizontal className="mr-2 size-4" />
                  전송
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}