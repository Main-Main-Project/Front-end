import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/pages/admin/adminShared";
import { getAdminMessages, getAdminSessions, type MessageDto, type SessionDto } from "@/lib/chatApi";
import { showToast } from "@/stores/notificationStore";

function formatDateTime(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

export function AdminChatsPage() {
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDto | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);

      try {
        const data = await getAdminSessions();

        setSessions(
          data.sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
        );
      } catch (error) {
        showToast({
          title: "세션 목록 조회 실패",
          description: error instanceof Error ? error.message : "관리자 세션 목록을 불러오지 못했습니다.",
          tone: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSessions();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoadingMessages(true);

      try {
        const data = await getAdminMessages();
        setMessages(data);
      } catch (error) {
        showToast({
          title: "메시지 목록 조회 실패",
          description: error instanceof Error ? error.message : "관리자 메시지 목록을 불러오지 못했습니다.",
          tone: "error",
        });
      } finally {
        setIsLoadingMessages(false);
      }
    };

    void fetchMessages();
  }, []);

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return sessions;

    return sessions.filter((session) => {
      return (
        session.title.toLowerCase().includes(query) ||
        session.session_id.toLowerCase().includes(query)
      );
    });
  }, [sessions, search]);

  const selectedSessionMessages = useMemo(() => {
    if (!selectedSession) return [];

    return messages
      .filter((message) => message.session_id === selectedSession.session_id)
      .sort(
        (a, b) => new Date(a.question_at).getTime() - new Date(b.question_at).getTime()
      );
  }, [messages, selectedSession]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-slate-500">
        세션 목록을 불러오는 중입니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SurfaceCard
        title="전체 세션"
        description="최근 수정된 순서대로 관리자 세션 목록을 보여줍니다."
        action={
          <div className="relative w-full md:w-[320px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="세션 제목 또는 ID 검색"
              className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-11"
            />
          </div>
        }
      >
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="w-[140px] px-5 py-4 font-medium">세션 ID</th>
                  <th className="px-5 py-4 font-medium">제목</th>
                  <th className="w-[180px] px-5 py-4 font-medium">생성일</th>
                  <th className="w-[180px] px-5 py-4 font-medium">최근 수정</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="h-[320px] px-5 py-10 text-center text-slate-500">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr
                      key={session.session_id}
                      className="cursor-pointer transition hover:bg-slate-50"
                      onClick={() => setSelectedSession(session)}
                    >
                      <td className="w-[140px] px-5 py-4 font-medium text-slate-800">
                        {session.session_id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="truncate">{session.title}</div>
                      </td>
                      <td className="w-[180px] px-5 py-4 text-slate-500">
                        {formatDateTime(session.created_at)}
                      </td>
                      <td className="w-[180px] px-5 py-4 text-slate-500">
                        {formatDateTime(session.updated_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SurfaceCard>
      {selectedSession ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm text-slate-500">
                  {selectedSession.session_id.slice(0, 8)} · {formatDateTime(selectedSession.created_at)}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {selectedSession.title}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSession(null)}
                aria-label="모달 닫기"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-6">
              {isLoadingMessages ? (
                <p className="text-sm text-slate-500">메시지를 불러오는 중입니다.</p>
              ) : selectedSessionMessages.length === 0 ? (
                <p className="text-sm text-slate-500">이 세션에 메시지가 없습니다.</p>
              ) : (
                selectedSessionMessages.map((message) => (
                  <div key={message.message_id} className="space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-xs font-semibold tracking-[0.12em] text-slate-400">질문</p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">{message.question}</p>
                      <p className="mt-2 text-xs text-slate-400">{formatDateTime(message.question_at)}</p>
                    </div>

                    <div className="rounded-2xl bg-blue-50 p-5">
                      <p className="text-xs font-semibold tracking-[0.12em] text-slate-400">답변</p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">{message.answer ?? "-"}</p>
                      <p className="mt-2 text-xs text-slate-400">{formatDateTime(message.answer_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <Button onClick={() => setSelectedSession(null)}>닫기</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
