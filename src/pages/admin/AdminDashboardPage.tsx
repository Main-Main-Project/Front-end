import {
  ActivityFeed,
  AdminPageIntro,
  adminStats,
  ChatMiniTable,
  DocumentMiniTable,
  FailureLogList,
  mockAdminActivities,
  mockAdminSystems,
  mockQuestionTrend,
  PageLinkHint,
  StatCard,
  StatusList,
  SurfaceCard,
  TrendChart,
} from "@/pages/admin/adminShared";

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <AdminPageIntro title="대시보드" description="사용자 현황, 문서 처리, 최근 채팅, 시스템 상태를 한 화면에서 확인합니다." />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr_0.9fr]">
        <SurfaceCard title="질문 수 추이" description="최근 7일 질문량 추이입니다.">
          <TrendChart points={mockQuestionTrend} />
        </SurfaceCard>

        <SurfaceCard title="최근 활동" description="사용자 및 파이프라인의 최신 이벤트입니다.">
          <ActivityFeed activities={mockAdminActivities} />
        </SurfaceCard>

        <SurfaceCard title="시스템 상태" description="핵심 서비스 상태를 빠르게 확인합니다.">
          <StatusList systems={mockAdminSystems} />
        </SurfaceCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SurfaceCard title="최근 업로드 문서" description="파이프라인 단계와 실패 사유를 함께 보여줍니다." action={<PageLinkHint label="전체 보기" to="/admin/documents" />}>
          <DocumentMiniTable />
        </SurfaceCard>

        <SurfaceCard title="최근 질문 / 답변" description="가장 최근 채팅 활동입니다." action={<PageLinkHint label="채팅 열기" to="/admin/chats" />}>
          <ChatMiniTable />
        </SurfaceCard>

        <SurfaceCard title="실패 로그" description="우선 확인이 필요한 항목입니다." action={<PageLinkHint label="확인하기" to="/admin/documents?status=failed" />}>
          <FailureLogList />
        </SurfaceCard>
      </div>
    </div>
  );
}
