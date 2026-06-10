import { useRef } from "react";
import { Paperclip, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/stores/chatStore";
import { useDocumentStore } from "@/stores/documentStore";
import { showToast } from "@/stores/notificationStore";

export function ChatPage() {
  const { sessions, activeSessionId, draft, setDraft, sendMessage } = useChatStore();
  const addUploadedDocuments = useDocumentStore((s) => s.addUploadedDocuments);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const active = sessions.find((s) => s.id === activeSessionId);

  // 숨겨진 file input을 버튼으로 트리거하기 위한 헬퍼.
  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="flex h-full w-full flex-col">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => {
          const files = e.target.files;
          addUploadedDocuments(files);

          if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
              showToast({
                title: "문서 업로드 완료",
                description: `${file.name} 문서가 업로드되었습니다.`,
                tone: "success",
              });
            });
          }

          e.target.value = "";
        }}
      />

      {!active ? (
        // 활성 세션이 없으면 "첫 질문" 빈 상태 화면을 보여준다.
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <h2 className="mb-6 text-center text-3xl font-semibold">무엇을 도와드릴까요?</h2>
          <div className="w-full max-w-3xl">
            <div className="rounded-3xl border border-border bg-input p-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="법률 질문이나 문서 검토 요청을 입력하세요."
                className="min-h-14 border-0 bg-transparent"
              />
              <div className="mt-2 flex items-center justify-between">
                <Button onClick={triggerUpload} variant="ghost" size="icon" aria-label="문서 업로드">
                  <Paperclip className="size-4" />
                </Button>
                <Button onClick={sendMessage}>
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
          <ScrollArea className="flex-1 px-4 py-6 md:px-10">
            <div className="mx-auto w-full max-w-4xl space-y-8">
              {active.messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[75%] ${
                      m.role === "user" ? "bg-primary text-primaryForeground" : "bg-muted text-foreground"
                    }`}
                  >
                    <p>{m.content}</p>
                    <span className="mt-2 block text-[11px] opacity-70">{m.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-4 md:px-10">
            <div className="mx-auto w-full max-w-4xl rounded-3xl border border-border bg-input p-3">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="추가 질문을 입력하세요."
                className="min-h-12 border-0 bg-transparent"
              />
              <div className="mt-2 flex items-center justify-between">
                <Button onClick={triggerUpload} variant="ghost" size="icon" aria-label="문서 업로드">
                  <Paperclip className="size-4" />
                </Button>
                <Button onClick={sendMessage}>
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