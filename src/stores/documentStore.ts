import { create } from "zustand";
import { type DocItem, type DocumentStatus } from "@/types/document";
import { getDocuments, getMyDocuments, type UploadedDocumentDto } from "@/lib/chatApi";

type DocumentState = {
  documents: DocItem[];
  isLoadingDocuments: boolean;
  loadDocuments: (sessionId: string) => Promise<void>;
  loadMyDocuments: () => Promise<void>;
  addUploadedDocument: (document: UploadedDocumentDto) => void;
  clearDocuments: () => void;
};

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
    summary: document.summary?.trim() || "요약 없음",
    uploadedAt: formatUploadedAt(document.created_at),
    createdAt: document.created_at,
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
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      });
    } finally {
      set({ isLoadingDocuments: false });
    }
  },

  loadMyDocuments: async () => {
    set({ isLoadingDocuments: true });

    try {
      const data = await getMyDocuments();

      set({
        documents: data
          .map(toDocItem)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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