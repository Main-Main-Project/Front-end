import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type DocumentStatus } from "@/data/mock";
import { AdminPageIntro, documentStatusLabel, DocumentRow, mockAdminDocuments, SurfaceCard } from "@/pages/admin/adminShared";

const statusTabs: Array<{ key: "all" | DocumentStatus; label: string }> = [
  { key: "all", label: "전체" },
  { key: "uploaded", label: "업로드" },
  { key: "ocr_done", label: "OCR 완료" },
  { key: "chunked", label: "청킹 완료" },
  { key: "embedded", label: "임베딩" },
  { key: "ready", label: "준비 완료" },
  { key: "failed", label: "실패" },
];

export function AdminDocumentsPage() {
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<"all" | DocumentStatus>("all");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "uploaded" || status === "ocr_done" || status === "chunked" || status === "embedded" || status === "ready" || status === "failed") {
      setActiveStatus(status);
    } else {
      setActiveStatus("all");
    }
  }, [searchParams]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mockAdminDocuments.filter((entry) => {
      const matchesQuery =
        !query ||
        entry.name.toLowerCase().includes(query) ||
        entry.owner.toLowerCase().includes(query) ||
        documentStatusLabel[entry.status].toLowerCase().includes(query);
      const matchesStatus = activeStatus === "all" || entry.status === activeStatus;
      return matchesQuery && matchesStatus;
    });
  }, [search, activeStatus]);

  const handleStatusChange = (status: "all" | DocumentStatus) => {
    setActiveStatus(status);
    if (status === "all") {
      setSearchParams({});
      return;
    }
    setSearchParams({ status });
  };

  return (
    <div className="space-y-6">
      <AdminPageIntro title="문서 관리" description="업로드, OCR, 임베딩, 실패 파이프라인 상태를 한 화면에서 확인합니다." />

      <SurfaceCard
        title="문서 파이프라인"
        description="상태 탭과 검색을 조합해 원하는 문서만 빠르게 확인할 수 있습니다."
        action={
          <div className="relative w-full md:w-[320px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="문서 검색" className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-11" />
          </div>
        }
      >
        <div className="mb-5 flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeStatus === tab.key ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => handleStatusChange(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredDocuments.map((entry) => (
            <DocumentRow key={entry.id} document={entry} />
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
