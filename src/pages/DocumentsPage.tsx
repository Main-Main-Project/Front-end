import { useEffect, useMemo, useState } from "react";
import { type DocumentStatus, type DocItem } from "@/types/document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useDocumentStore } from "@/stores/documentStore";
import { useUiStore } from "@/stores/uiStore";
import { showToast } from "@/stores/notificationStore";
import { useChatStore } from "@/stores/chatStore";

const statusVariant: Record<DocumentStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  uploaded: "default",
  ocr_done: "info",
  chunked: "warning",
  embedded: "success",
  ready: "success",
  failed: "danger",
};

const statusLabel: Record<DocumentStatus, string> = {
  uploaded: "업로드 완료",
  ocr_done: "OCR 완료",
  chunked: "청크 완료",
  embedded: "요약 완료",
  ready: "요약 완료",
  failed: "실패",
};

export function DocumentsPage() {
  const documents = useDocumentStore((s) => s.documents);
  const isLoadingDocuments = useDocumentStore((s) => s.isLoadingDocuments);
  const loadMyDocuments = useDocumentStore((s) => s.loadMyDocuments);
  const documentSearchQuery = useUiStore((s) => s.documentSearchQuery);
  const removeDocument = useDocumentStore((s) => s.removeDocument);
  const isDeletingDocument = useDocumentStore((s) => s.isDeletingDocument);
  const loadSessions = useChatStore((s) => s.loadSessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const selectSession = useChatStore((s) => s.selectSession);
  const startNewChat = useChatStore((s) => s.startNewChat);

  // 검색어가 있으면 파일명/요약 기준으로 실시간 필터링한다.
  const filteredDocuments = useMemo(() => {
    const q = documentSearchQuery.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((doc) => doc.name.toLowerCase().includes(q) || doc.summary.toLowerCase().includes(q));
  }, [documents, documentSearchQuery]);

  const [selected, setSelected] = useState<DocItem | null>(filteredDocuments[0] ?? null);

  useEffect(() => {
    void loadMyDocuments();
  }, [loadMyDocuments]);

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

    if (isLoadingDocuments) {
      return (
        <div className="flex h-full w-full items-center justify-center p-8 text-mutedForeground">
          문서를 불러오는 중입니다.
        </div>
      );
    }

  if (documents.length === 0) {
    return <div className="flex h-full w-full items-center justify-center p-8 text-mutedForeground">업로드된 문서가 없습니다.</div>;
  }

  if (filteredDocuments.length === 0) {
    return <div className="flex h-full w-full items-center justify-center p-8 text-mutedForeground">검색 결과가 없습니다.</div>;
  }

  const handleDeleteDocument = async () => {
    if (!selected) return;

    const confirmed = window.confirm(`"${selected.name}" 문서를 삭제하시겠습니까?`);
    if (!confirmed) return;

    try {
      const deletedSessionId = selected.sessionId;
      const result = await removeDocument(selected.id);

      if (result.chat_session_deleted) {
        const wasActiveSessionDeleted = activeSessionId === deletedSessionId;

        await loadSessions();

        const nextSessions = useChatStore.getState().sessions;

        if (wasActiveSessionDeleted) {
          if (nextSessions.length > 0) {
            await selectSession(nextSessions[0].id);
          } else {
            startNewChat();
          }
        }
      }

      showToast({
        title: "문서 삭제 완료",
        description: "문서가 삭제되었습니다.",
        tone: "success",
      });
    } catch (error) {
      showToast({
        title: "문서 삭제 실패",
        description: error instanceof Error ? error.message : "문서 삭제 중 오류가 발생했습니다.",
        tone: "error",
      });
    }
  };

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

                <div className="mt-2">
                  <Badge variant={statusVariant[doc.status]}>{statusLabel[doc.status]}</Badge>
                </div>

                <p className="mt-2 text-xs text-mutedForeground">
                  {doc.uploadedAt}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">문서 요약</h2>
            <p className="mt-2 truncate text-sm text-mutedForeground">{selected.name}</p>
            <div className="mt-3 flex items-center gap-3 text-sm text-mutedForeground">
              <Badge variant={statusVariant[selected.status]}>{statusLabel[selected.status]}</Badge>
              <span>업로드: {selected.uploadedAt}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleDeleteDocument()}
            disabled={isDeletingDocument}
          >
            {isDeletingDocument ? "삭제 중..." : "삭제"}
          </Button>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-muted/50 p-4 text-sm leading-7">
          {selected.summary}
        </div>
      </Card>
    </div>
  );
}

