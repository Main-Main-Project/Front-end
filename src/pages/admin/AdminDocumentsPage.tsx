import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAdminDocuments, deleteAdminDocument, type UploadedDocumentDto } from "@/lib/chatApi";
import { showToast } from "@/stores/notificationStore";
import { type AdminDocumentRow, type AdminDocumentStatus } from "@/types/adminDocument";
import { documentStatusLabel, DocumentRow, SurfaceCard } from "@/pages/admin/adminShared";

const statusTabs: Array<{ key: "all" | AdminDocumentStatus; label: string }> = [
  { key: "all", label: "전체" },
  { key: "uploaded", label: "업로드" },
  { key: "ocr_done", label: "OCR 완료" },
  { key: "chunked", label: "청킹 완료" },
  { key: "embedded", label: "임베딩" },
  { key: "ready", label: "준비 완료" },
  { key: "failed", label: "실패" },
];

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

function mapAdminDocumentStatus(
  status: "UPLOADED" | "OCR_DONE" | "CHUNKED" | "EMBEDDED" | "READY" | "FAILED"
): AdminDocumentStatus {
  switch (status) {
    case "UPLOADED":
      return "uploaded";
    case "OCR_DONE":
      return "ocr_done";
    case "CHUNKED":
      return "chunked";
    case "EMBEDDED":
      return "embedded";
    case "READY":
      return "ready";
    case "FAILED":
      return "failed";
    default:
      return "uploaded";
  }
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

export function AdminDocumentsPage() {
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<"all" | AdminDocumentStatus>("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState<AdminDocumentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);

      try {
        const data = await getAdminDocuments();

        setDocuments(
          data
            .map(toAdminDocumentRow)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      } catch (error) {
        showToast({
          title: "문서 목록 조회 실패",
          description: error instanceof Error ? error.message : "관리자 문서 목록을 불러오지 못했습니다.",
          tone: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDocuments();
  }, []);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "uploaded" || status === "ocr_done" || status === "chunked" || status === "embedded" || status === "ready" || status === "failed") {
      setActiveStatus(status);
    } else {
      setActiveStatus("all");
    }
  }, [searchParams]);

    const handleDeleteDocument = async (document: AdminDocumentRow) => {
      const confirmed = window.confirm(`"${document.name}" 문서를 삭제하시겠습니까?`);
      if (!confirmed) return;

      try {
        setIsDeleting(true);
        await deleteAdminDocument(document.id);

        setDocuments((prev) => prev.filter((item) => item.id !== document.id));

        showToast({
          title: "문서 삭제 완료",
          description: "관리자 문서가 삭제되었습니다.",
          tone: "success",
        });
      } catch (error) {
        showToast({
          title: "문서 삭제 실패",
          description: error instanceof Error ? error.message : "관리자 문서 삭제 중 오류가 발생했습니다.",
          tone: "error",
        });
      } finally {
        setIsDeleting(false);
      }
    };

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return documents.filter((entry) => {
      const matchesQuery =
        !query ||
        entry.name.toLowerCase().includes(query) ||
        entry.userId.toLowerCase().includes(query) ||
        documentStatusLabel[entry.status].toLowerCase().includes(query);
      const matchesStatus = activeStatus === "all" || entry.status === activeStatus;
      return matchesQuery && matchesStatus;
    });
  }, [documents, search, activeStatus]);

  const handleStatusChange = (status: "all" | AdminDocumentStatus) => {
    setActiveStatus(status);
    if (status === "all") {
      setSearchParams({});
      return;
    }
    setSearchParams({ status });
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-slate-500">
        문서를 불러오는 중입니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <DocumentRow
              key={entry.id}
              document={entry}
              onDelete={handleDeleteDocument}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
