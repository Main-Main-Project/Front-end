import { useEffect, useState } from "react";
import { getAdminDocuments, getAdminMessages, type MessageDto, type UploadedDocumentDto } from "@/lib/chatApi";
import { showToast } from "@/stores/notificationStore";
import { type AdminDocumentRow, type AdminDocumentStatus } from "@/types/adminDocument";
import {
  ActivityFeed,
  getAdminStats,
  ChatMiniTable,
  DocumentMiniTable,
  FailureLogList,
  mockAdminActivities,
  mockAdminSystems,
  PageLinkHint,
  StatCard,
  StatusList,
  SurfaceCard,
  TrendChart,
} from "@/pages/admin/adminShared";

type AdminChatMiniRow = {
  id: string;
  userName: string;
  question: string;
  answerTime: string;
};

function formatUploadedAt(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatTime(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  return `${hh}:${mm}`;
}

function isSameDay(date: Date, target: Date) {
  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
}

function getCountByDay<T>(items: T[], getDate: (item: T) => string, target: Date) {
  return items.filter((item) => isSameDay(new Date(getDate(item)), target)).length;
}

function formatDailyChange(today: number, yesterday: number, zeroLabel: string) {
  if (yesterday > 0) {
    const change = ((today - yesterday) / yesterday) * 100;
    const sign = change > 0 ? "+" : "";
    return `전일 대비 ${sign}${change.toFixed(1)}%`;
  }

  if (today === 0) {
    return "전일과 동일";
  }

  return zeroLabel;
}

function buildQuestionTrend(messages: MessageDto[]) {
  const today = new Date();
  const result = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;

    const value = messages.filter((message) => {
      const messageDate = new Date(message.question_at);
      const messageKey = `${messageDate.getFullYear()}-${String(messageDate.getMonth() + 1).padStart(2, "0")}-${String(messageDate.getDate()).padStart(2, "0")}`;
      return messageKey === key;
    }).length;

    result.push({
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      value,
    });
  }

  return result;
}

const ADMIN_DOCUMENT_STATUS_MAP: Record<UploadedDocumentDto["status"], AdminDocumentStatus> = {
  UPLOADED: "uploaded",
  OCR_DONE: "ocr_done",
  CHUNKED: "chunked",
  EMBEDDED: "embedded",
  READY: "ready",
  FAILED: "failed",
};

function mapAdminDocumentStatus(status: UploadedDocumentDto["status"]): AdminDocumentStatus {
  return ADMIN_DOCUMENT_STATUS_MAP[status];
}

function toAdminDocumentRow(document: UploadedDocumentDto): AdminDocumentRow {
  return {
    id: document.document_id,
    sessionId: document.session_id,
    userId: document.user_id,
    name: document.file_name,
    status: mapAdminDocumentStatus(document.status),
    summary: document.summary?.trim() || "요약 없음",
    uploadedAt: formatUploadedAt(document.created_at),
    createdAt: document.created_at,
    failureReason: null,
  };
}

export function AdminDashboardPage() {
  const [documents, setDocuments] = useState<AdminDocumentRow[]>([]);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [recentChats, setRecentChats] = useState<AdminChatMiniRow[]>([]);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const todayQuestionCount = getCountByDay(messages, (message) => message.question_at, today);
  const yesterdayQuestionCount = getCountByDay(messages, (message) => message.question_at, yesterday);

  const todayFailedDocumentCount = documents.filter((document) => {
    return document.status === "failed" && isSameDay(new Date(document.createdAt), today);
  }).length;

  const yesterdayFailedDocumentCount = documents.filter((document) => {
    return document.status === "failed" && isSameDay(new Date(document.createdAt), yesterday);
  }).length;

  const questionTrend = buildQuestionTrend(messages);

  const todayQuestionDetail = formatDailyChange(
    todayQuestionCount,
    yesterdayQuestionCount,
    "오늘 첫 집계"
  );

  const failedDocumentDetail = formatDailyChange(
    todayFailedDocumentCount,
    yesterdayFailedDocumentCount,
    "신규 발생"
  );
  
  const adminStats = getAdminStats({
    documentCount: documents.length,
    todayQuestionCount,
    failedDocumentCount: todayFailedDocumentCount,
    todayQuestionDetail,
    failedDocumentDetail,
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await getAdminDocuments();

        setDocuments(
          data
            .map(toAdminDocumentRow)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      } catch (error) {
        showToast({
          title: "최근 문서 조회 실패",
          description: error instanceof Error ? error.message : "대시보드 문서 목록을 불러오지 못했습니다.",
          tone: "error",
        });
      }
    };

    void fetchDocuments();
  }, []);

  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const data = await getAdminMessages();
        setMessages(data);
        setRecentChats(
          data
            .sort((a, b) => new Date(b.question_at).getTime() - new Date(a.question_at).getTime())
            .slice(0, 5)
            .map((item) => ({
              id: item.message_id,
              userName: item.user_id.slice(0, 8),
              question: item.question,
              answerTime: formatTime(item.answer_at),
            }))
        );
      } catch (error) {
        showToast({
          title: "최근 질문 조회 실패",
          description: error instanceof Error ? error.message : "대시보드 질문 목록을 불러오지 못했습니다.",
          tone: "error",
        });
      }
    };

    void fetchRecentChats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr_0.9fr]">
        <SurfaceCard title="질문 수 추이" description="최근 7일 질문량 추이입니다.">
          <TrendChart points={questionTrend} />
        </SurfaceCard>

        <SurfaceCard title="최근 활동" description="사용자 및 파이프라인의 최신 이벤트입니다.">
          <ActivityFeed activities={mockAdminActivities} />
        </SurfaceCard>

        <SurfaceCard title="시스템 상태" description="핵심 서비스 상태를 빠르게 확인합니다.">
          <StatusList systems={mockAdminSystems} />
        </SurfaceCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SurfaceCard title="최근 업로드 문서" description="파이프라인 단계와 실패 사유를 함께 보여줍니다." action={<PageLinkHint label="전체 보기" to="/admin/documents" />} className="min-h-[520px]">
          <DocumentMiniTable documents={documents.slice(0, 5)} />
        </SurfaceCard>

        <SurfaceCard title="최근 질문" description="가장 최근 채팅 활동입니다." action={<PageLinkHint label="채팅 열기" to="/admin/chats" />} className="min-h-[520px]">
          <ChatMiniTable chats={recentChats}/>
        </SurfaceCard>

        <SurfaceCard title="실패 로그" description="우선 확인이 필요한 항목입니다." action={<PageLinkHint label="확인하기" to="/admin/documents?status=failed" />} className="min-h-[520px]">
          <FailureLogList />
        </SurfaceCard>
      </div>
    </div>
  );
}
