import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageIntro, AdminTable, mockAdminChats, SurfaceCard } from "@/pages/admin/adminShared";
import type { AdminChatRow } from "@/data/mock";

export function AdminChatsPage() {
  const [selectedChat, setSelectedChat] = useState<AdminChatRow | null>(null);

  return (
    <div className="space-y-6">
      <AdminPageIntro title="채팅 모니터링" description="최근 질문과 생성된 답변을 검토할 수 있는 화면입니다." />

      <SurfaceCard title="최근 질문과 답변" description="행을 클릭하면 질문과 답변 상세를 모달에서 확인할 수 있습니다.">
        <AdminTable headers={["사용자", "질문", "답변 미리보기", "시간"]}>
          {mockAdminChats.map((entry) => (
            <tr key={entry.id} className="cursor-pointer transition hover:bg-slate-50" onClick={() => setSelectedChat(entry)}>
              <td className="px-5 py-4 font-medium text-slate-800">{entry.userName}</td>
              <td className="px-5 py-4 text-slate-600">{entry.question}</td>
              <td className="px-5 py-4 text-slate-500">{entry.answerPreview}</td>
              <td className="px-5 py-4 text-slate-500">{entry.answerTime}</td>
            </tr>
          ))}
        </AdminTable>
      </SurfaceCard>

      {selectedChat ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm text-slate-500">{selectedChat.userName} · {selectedChat.createdAt}</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">채팅 상세</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedChat(null)} aria-label="모달 닫기">
                <X className="size-4" />
              </Button>
            </div>
            <div className="space-y-5 px-6 py-6">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-semibold tracking-[0.12em] text-slate-400">질문</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">{selectedChat.question}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-xs font-semibold tracking-[0.12em] text-slate-400">답변</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">{selectedChat.answerBody}</p>
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <Button onClick={() => setSelectedChat(null)}>닫기</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
