import { useEffect, useMemo, useState } from "react";
import { type DocumentStatus, type DocItem } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useDocumentStore } from "@/stores/documentStore";
import { useUiStore } from "@/stores/uiStore";

const statusVariant: Record<DocumentStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  uploaded: "default",
  ocr_done: "info",
  chunked: "warning",
  embedded: "info",
  ready: "success",
  failed: "danger",
};

export function DocumentsPage() {
  const documents = useDocumentStore((s) => s.documents);
  const documentSearchQuery = useUiStore((s) => s.documentSearchQuery);

  // 검색어가 있으면 파일명/요약 기준으로 실시간 필터링한다.
  const filteredDocuments = useMemo(() => {
    const q = documentSearchQuery.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((doc) => doc.name.toLowerCase().includes(q) || doc.summary.toLowerCase().includes(q));
  }, [documents, documentSearchQuery]);

  const [selected, setSelected] = useState<DocItem | null>(filteredDocuments[0] ?? null);

  useEffect(() => {
    // 필터 결과가 바뀌었을 때 선택 문서가 유효하지 않으면 첫 문서로 보정한다.
    if (filteredDocuments.length === 0) {
      setSelected(null);
      return;
    }

    if (!selected || !filteredDocuments.some((doc) => doc.id === selected.id)) {
      setSelected(filteredDocuments[0]);
    }
  }, [filteredDocuments, selected]);

  if (documents.length === 0) {
    return <div className="flex h-full w-full items-center justify-center p-8 text-mutedForeground">업로드된 문서가 없습니다.</div>;
  }

  if (filteredDocuments.length === 0) {
    return <div className="flex h-full w-full items-center justify-center p-8 text-mutedForeground">검색 결과가 없습니다.</div>;
  }

  if (!selected) return null;

  return (
    <div className="grid h-full w-full grid-cols-1 gap-4 p-4 md:grid-cols-[360px_1fr]">
      <Card className="overflow-hidden">
        <ScrollArea className="h-full p-3">
          <div className="space-y-2">
            {filteredDocuments.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelected(doc)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                  selected.id === doc.id
                    ? "border-border bg-accent"
                    : "border-transparent bg-muted/60 hover:border-border hover:bg-muted"
                }`}
              >
                <p className="truncate text-sm font-medium">{doc.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant={statusVariant[doc.status]}>{doc.status}</Badge>
                  <span className="text-xs text-mutedForeground">{doc.updatedAt}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold">문서 요약</h2>
        <p className="mt-2 text-sm text-mutedForeground">{selected.name}</p>
        <div className="mt-6 rounded-xl border border-border bg-muted/50 p-4 text-sm leading-7">{selected.summary}</div>
      </Card>
    </div>
  );
}

