import { create } from "zustand";
import { type DocItem, type DocumentStatus } from "@/data/mock";
import { getDocuments, type UploadedDocumentDto } from "@/lib/chatApi";

type DocumentState = {
  documents: DocItem[];
  isLoadingDocuments: boolean;
  loadDocuments: (sessionId: string) => Promise<void>;
  addUploadedDocument: (document: UploadedDocumentDto) => void;
  clearDocuments: () => void;
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
  documents: [],
  isLoadingDocuments: false,

  loadDocuments: async (sessionId) => {
    set({ isLoadingDocuments: true });

    try {
      const data = await getDocuments(sessionId);

      set({
        documents: data
          .map(toDocItem)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      });
    } finally {
      set({ isLoadingDocuments: false });
    }
  },

  addUploadedDocument: (document) => {
    const created = toDocItem(document);

    set({
      documents: [
        created,
        ...get().documents.filter((item) => item.id !== created.id),
      ],
    });
  },

  clearDocuments: () => {
    set({ documents: [] });
  },
}));