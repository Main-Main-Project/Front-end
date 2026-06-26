import { useEffect, useState } from "react";
import {
  getAdminDocuments,
  getAdminMessages,
  getAdminInfoLogs,
  getAdminErrorLogs,
  getAdminUsers,
  type AdminLogDto,
  type MessageDto,
  type UploadedDocumentDto,
} from "@/lib/chatApi";
import { showToast } from "@/stores/notificationStore";
import { type AdminDocumentRow, type AdminDocumentStatus } from "@/types/adminDocument";
import {
  ActivityFeed,
  getAdminStats,
  ChatMiniTable,
  DocumentMiniTable,
  FailureLogList,
  type FailureLogItem,
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

type AdminActivityRow = {
  id: string;
  icon: "document" | "chat" | "user" | "alert";
  title: string;
  timestamp: string;
};

function formatLogTimestamp(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getActivityIcon(endpoint: string, level: string): AdminActivityRow["icon"] {
  const normalized = endpoint.toLowerCase();

  if (level === "ERROR" || level === "WARN") return "alert";
  if (normalized.includes("document")) return "document";
  if (normalized.includes("user") || normalized.includes("auth")) return "user";
  return "chat";
}

function toActivityRow(log: AdminLogDto): AdminActivityRow {
  return {
    id: log.log_id,
    icon: getActivityIcon(log.endpoint, log.level),
    title: log.message,
    timestamp: formatLogTimestamp(log.created_at),
  };
}

function toFailureLogRow(log: AdminLogDto): FailureLogItem {
  return {
    id: log.log_id,
    timestamp: formatLogTimestamp(log.created_at),
    item: log.endpoint,
    reason: log.message,
  };
}

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

function toAdminDocumentRow(
  document: UploadedDocumentDto,
  userMap: Map<string, string>
): AdminDocumentRow {
  return {
    id: document.document_id,
    sessionId: document.session_id,
    userId: document.user_id,
    userName: userMap.get(document.user_id) ?? "알 수 없음",
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
  const [userCount, setUserCount] = useState(0);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [recentChats, setRecentChats] = useState<AdminChatMiniRow[]>([]);
  const [activities, setActivities] = useState<AdminActivityRow[]>([]);
  const [failureLogs, setFailureLogs] = useState<FailureLogItem[]>([]);

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
    userCount,
    documentCount: documents.length,
    todayQuestionCount,
    failedDocumentCount: todayFailedDocumentCount,
    todayQuestionDetail,
    failedDocumentDetail,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAdminUsers();
        setUserCount(data.length);
      } catch (error) {
        showToast({
          title: "사용자 수 조회 실패",
          description: error instanceof Error ? error.message : "관리자 사용자 수를 불러오지 못했습니다.",
          tone: "error",
        });
      }
    };

    void fetchUsers();
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const [documentData, userData] = await Promise.all([
          getAdminDocuments(),
          getAdminUsers(),
        ]);

        const userMap = new Map<string, string>(
          userData.map((user) => [user.user_id, user.name])
        );

        setDocuments(
          documentData
            .map((document) => toAdminDocumentRow(document, userMap))
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
              userName: item.user_name,
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

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getAdminInfoLogs();
        setActivities(data.slice(0, 5).map(toActivityRow));
      } catch (error) {
        showToast({
          title: "활동 로그 조회 실패",
          description: error instanceof Error ? error.message : "관리자 활동 로그를 불러오지 못했습니다.",
          tone: "error",
        });
      }
    };

    void fetchActivities();
  }, []);

  useEffect(() => {
    const fetchFailureLogs = async () => {
      try {
        const data = await getAdminErrorLogs();
        setFailureLogs(data.slice(0, 5).map(toFailureLogRow));
      } catch (error) {
        showToast({
          title: "실패 로그 조회 실패",
          description: error instanceof Error ? error.message : "관리자 실패 로그를 불러오지 못했습니다.",
          tone: "error",
        });
      }
    };

    void fetchFailureLogs();
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
          <ActivityFeed activities={activities} />
        </SurfaceCard>

        <SurfaceCard title="시스템 상태" description="핵심 서비스 상태를 빠르게 확인합니다.">
          <StatusList systems={mockAdminSystems} />
        </SurfaceCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SurfaceCard title="최근 업로드 문서" description="파이프라인 단계와 실패 사유를 함께 보여줍니다." action={<PageLinkHint label="전체 보기" to="/admin/documents" />} className="min-h-[520px]">
          <DocumentMiniTable documents={documents.slice(0, 5)} />
        </SurfaceCard>

        <SurfaceCard title="최근 메시지" description="가장 최근 채팅 활동입니다." action={<PageLinkHint label="세션 보기" to="/admin/chats" />} className="min-h-[520px]">
          <ChatMiniTable chats={recentChats}/>
        </SurfaceCard>

        <SurfaceCard title="실패 로그" description="우선 확인이 필요한 항목입니다." action={<PageLinkHint label="확인하기" to="/admin/documents?status=failed" />} className="min-h-[520px]">
          <FailureLogList logs={failureLogs} />
        </SurfaceCard>
      </div>
    </div>
  );
}
