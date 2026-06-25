import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Database,
  FileText,
  MessageSquare,
  type LucideIcon,
  ShieldAlert,
  UserRound,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  mockAdminActivities,
  mockAdminChats,
  mockAdminSystems,
  mockAdminUsers,
  mockFailureLogs,
  mockQuestionTrend,
  type AdminActivityRow,
  type AdminSystemStatus,
  type AdminUserRow,
  type TrendPoint,
} from "@/data/mock";
import { type AdminDocumentRow, type AdminDocumentStatus } from "@/types/adminDocument";


export const documentStatusVariant: Record<AdminDocumentStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  uploaded: "default",
  ocr_done: "info",
  chunked: "warning",
  embedded: "warning",
  ready: "success",
  failed: "danger",
};

export const documentStatusLabel: Record<AdminDocumentStatus, string> = {
  uploaded: "업로드 완료",
  ocr_done: "OCR 완료",
  chunked: "청킹 완료",
  embedded: "임베딩 중",
  ready: "준비 완료",
  failed: "실패",
};

export const userStatusVariant: Record<AdminUserRow["status"], "success" | "warning" | "danger"> = {
  active: "success",
  dormant: "warning",
  inactive: "danger",
};

export const userStatusLabel: Record<AdminUserRow["status"], string> = {
  active: "활성",
  dormant: "휴면",
  inactive: "정지",
};

export const systemStatusLabel: Record<AdminSystemStatus["status"], string> = {
  healthy: "정상",
  degraded: "주의",
  offline: "오프라인",
};

export function getAdminStats(documentCount: number) {
  return [
    {
      label: "총 사용자 수",
      value: "1,245",
      unit: "명",
      detail: "전체 가입 사용자",
      accent: "from-blue-50 to-indigo-50",
      iconColor: "text-blue-600",
      iconWrap: "bg-blue-100",
      icon: Users,
    },
    {
      label: "오늘 질문 수",
      value: "856",
      unit: "건",
      detail: "전일 대비 +12.5%",
      accent: "from-emerald-50 to-teal-50",
      iconColor: "text-emerald-600",
      iconWrap: "bg-emerald-100",
      icon: MessageSquare,
    },
    {
      label: "업로드 문서 수",
      value: String(documentCount),
      unit: "개",
      detail: "전체 문서 기준",
      accent: "from-amber-50 to-orange-50",
      iconColor: "text-amber-600",
      iconWrap: "bg-amber-100",
      icon: FileText,
    },
    {
      label: "실패 건수",
      value: "4",
      unit: "건",
      detail: "전일 대비 -11.1%",
      accent: "from-rose-50 to-pink-50",
      iconColor: "text-rose-600",
      iconWrap: "bg-rose-100",
      icon: ShieldAlert,
    },
  ] as const;
}

export {
  mockAdminActivities,
  mockAdminChats,
  mockAdminSystems,
  mockAdminUsers,
  mockFailureLogs,
  mockQuestionTrend,
};

export function AdminPageIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function SurfaceCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`rounded-3xl border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.05)] ${className}`}>
      <CardHeader className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}

export function StatCard({
  label,
  value,
  unit,
  detail,
  accent,
  icon: Icon,
  iconColor,
  iconWrap,
}: {
  label: string;
  value: string;
  unit: string;
  detail: string;
  accent: string;
  icon: LucideIcon;
  iconColor: string;
  iconWrap: string;
}) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-gradient-to-br ${accent} p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]`}>
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconWrap}`}>
        <Icon className={`size-6 ${iconColor}`} />
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-4xl font-semibold tracking-tight text-slate-950">{value}</span>
        <span className="pb-1 text-sm font-medium text-slate-400">{unit}</span>
      </div>
      <p className="mt-3 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

export function TrendChart({ points }: { points: TrendPoint[] }) {
  const max = Math.max(...points.map((point) => point.value));
  const width = 560;
  const height = 240;
  const padding = 24;
  const stepX = (width - padding * 2) / Math.max(points.length - 1, 1);
  const plotHeight = height - padding * 2;
  const coords = points.map((point, index) => {
    const x = padding + stepX * index;
    const y = height - padding - (point.value / max) * plotHeight;
    return { ...point, x, y };
  });
  const line = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = `${line} L ${coords[coords.length - 1]?.x ?? padding} ${height - padding} L ${coords[0]?.x ?? padding} ${height - padding} Z`;

  return (
    <div className="space-y-4">
      <div className="relative rounded-3xl bg-slate-50 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              x2={width - padding}
              y1={height - padding - plotHeight * ratio}
              y2={height - padding - plotHeight * ratio}
              stroke="#dbe3f0"
              strokeDasharray="4 6"
            />
          ))}
          <path d={area} fill="url(#trendFill)" />
          <path d={line} fill="none" stroke="#2962ff" strokeWidth="4" strokeLinecap="round" />
          {coords.map((point) => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} r="6" fill="#2962ff" />
              <circle cx={point.x} cy={point.y} r="12" fill="#2962ff" fillOpacity="0.12" />
            </g>
          ))}
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2962ff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2962ff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div className="mt-2 grid grid-cols-7 text-center text-xs text-slate-400">
          {points.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const activityIconMap: Record<AdminActivityRow["icon"], LucideIcon> = {
  document: FileText,
  chat: MessageSquare,
  user: UserRound,
  alert: AlertTriangle,
};

const activityColorMap: Record<AdminActivityRow["icon"], string> = {
  document: "bg-blue-100 text-blue-600",
  chat: "bg-violet-100 text-violet-600",
  user: "bg-emerald-100 text-emerald-600",
  alert: "bg-rose-100 text-rose-600",
};

export function ActivityFeed({ activities }: { activities: AdminActivityRow[] }) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activityIconMap[activity.icon];
        return (
          <div key={activity.id} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${activityColorMap[activity.icon]}`}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-6 text-slate-800">{activity.title}</p>
              <p className="mt-1 text-xs text-slate-500">{activity.timestamp}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StatusList({ systems }: { systems: AdminSystemStatus[] }) {
  return (
    <div className="space-y-3">
      {systems.map((system) => (
        <div key={system.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
              <Database className="size-5 text-slate-700" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{system.name}</p>
              <p className="text-xs text-slate-500">{system.detail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status={system.status} />
            <span className="text-sm font-medium text-slate-600">{systemStatusLabel[system.status]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusDot({ status }: { status: "healthy" | "degraded" | "offline" }) {
  const colorClass = status === "healthy" ? "bg-emerald-500" : status === "degraded" ? "bg-amber-500" : "bg-rose-500";
  return <span className={`inline-flex h-2.5 w-2.5 rounded-full ${colorClass}`} />;
}

export function AdminTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-5 py-4 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function FailureLogList() {
  return (
    <AdminTable headers={["시간", "항목", "사유"]}>
      {mockFailureLogs.map((entry) => (
        <tr key={entry.id}>
          <td className="px-5 py-4 text-slate-500">{entry.timestamp}</td>
          <td className="px-5 py-4 font-medium text-slate-800">{entry.item}</td>
          <td className="px-5 py-4 text-slate-500">{entry.reason}</td>
        </tr>
      ))}
    </AdminTable>
  );
}

export function ChatMiniTable() {
  return (
    <AdminTable headers={["사용자", "질문", "답변 시간"]}>
      {mockAdminChats.map((entry) => (
        <tr key={entry.id}>
          <td className="px-5 py-4 font-medium text-slate-800">{entry.userName}</td>
          <td className="px-5 py-4 text-slate-600">{entry.question}</td>
          <td className="px-5 py-4 text-slate-500">{entry.answerTime}</td>
        </tr>
      ))}
    </AdminTable>
  );
}

export function DocumentMiniTable({ documents }: { documents: AdminDocumentRow[] }) {
  return (
    <AdminTable headers={["문서명", "업로드", "상태", "실패 사유"]}>
      {documents.map((entry) => (
        <tr key={entry.id}>
          <td className="px-5 py-4 font-medium text-slate-800">{entry.name}</td>
          <td className="px-5 py-4 text-slate-500">{entry.uploadedAt}</td>
          <td className="px-5 py-4">
            <Badge variant={documentStatusVariant[entry.status]}>
              {documentStatusLabel[entry.status]}
            </Badge>
          </td>
          <td className="px-5 py-4 text-slate-500">{entry.failureReason ?? "-"}</td>
        </tr>
      ))}
    </AdminTable>
  );
}

export function PageLinkHint({ label, to }: { label: string; to: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700">
      <span>{label}</span>
      <ChevronRight className="size-4" />
    </Link>
  );
}

export function UserStatusBadge({ status }: { status: AdminUserRow["status"] }) {
  return (
    <div className="inline-flex items-center gap-2">
      <StatusDot status={status === "active" ? "healthy" : status === "dormant" ? "degraded" : "offline"} />
      <Badge variant={userStatusVariant[status]}>{userStatusLabel[status]}</Badge>
    </div>
  );
}

export function RoleBadge({ isAdmin }: { isAdmin: boolean }) {
  return <Badge variant={isAdmin ? "info" : "default"}>{isAdmin ? "관리자" : "일반"}</Badge>;
}

export function DocumentRow({
  document,
  onDelete,
  isDeleting,
}: {
  document: AdminDocumentRow;
  onDelete: (document: AdminDocumentRow) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-semibold text-slate-900">{document.name}</p>
            <Badge variant={documentStatusVariant[document.status]}>{documentStatusLabel[document.status]}</Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">{document.summary}</p>
        </div>
        <div className="flex flex-col gap-3 lg:min-w-[220px]">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            <p>업로더 ID: {document.userId}</p>
            <p className="mt-1">업로드: {document.uploadedAt}</p>
          </div>

          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(document)}
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        </div>
      </div>
      {document.failureReason ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{document.failureReason}</div>
      ) : null}
    </div>
  );
}

export function SystemStatusCard({ system }: { system: AdminSystemStatus }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">{system.name}</p>
          <p className="mt-1 text-sm text-slate-500">{system.detail}</p>
        </div>
        {system.status === "healthy" ? (
          <CheckCircle2 className="size-6 text-emerald-500" />
        ) : system.status === "degraded" ? (
          <AlertTriangle className="size-6 text-amber-500" />
        ) : (
          <ShieldAlert className="size-6 text-rose-500" />
        )}
      </div>
    </div>
  );
}
