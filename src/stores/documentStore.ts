import { create } from "zustand";
import { mockDocuments, type DocItem, type DocumentStatus } from "@/data/mock";
import type { UploadedDocumentDto } from "@/lib/chatApi";

type DocumentState = {
  documents: DocItem[];
  addUploadedDocument: (document: UploadedDocumentDto) => void;
};

function mapDocumentStatus(status: UploadedDocumentDto["status"]): DocumentStatus {
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

function toDocItem(document: UploadedDocumentDto): DocItem {
  return {
    id: document.document_id,
    name: document.file_name,
    status: mapDocumentStatus(document.status),
    summary: document.summary?.trim() || "업로드 완료",
    updatedAt: document.created_at.slice(0, 10),
  };
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: mockDocuments,
  addUploadedDocument: (document) => {
    const created = toDocItem(document);

    set({
      documents: [
        created,
        ...get().documents.filter((item) => item.id !== created.id),
      ],
    });
  },
}));