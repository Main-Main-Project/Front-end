import { AdminPageIntro, mockAdminSystems, SystemStatusCard, SurfaceCard } from "@/pages/admin/adminShared";

export function AdminSystemsPage() {
  return (
    <div className="space-y-6">
      <AdminPageIntro title="시스템 상태" description="백엔드, 데이터베이스, 모델 서버, 벡터 저장소 상태를 모아봅니다." />

      <SurfaceCard title="연결된 서비스" description="현재는 간단한 상태 카드로 두고, 이후 실시간 지표나 로그 드릴다운으로 확장할 수 있습니다.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {mockAdminSystems.map((entry) => (
            <SystemStatusCard key={entry.name} system={entry} />
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
