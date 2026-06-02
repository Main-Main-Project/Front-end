import { create } from "zustand";
import { mockDocuments, type DocItem } from "@/data/mock";

type DocumentState = {
  documents: DocItem[];
  addUploadedDocuments: (files: FileList | null) => void;
};

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: mockDocuments,
  addUploadedDocuments: (files) => {
    // 파일이 없으면 상태를 변경하지 않는다.
    if (!files || files.length === 0) return;

    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const created: DocItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      status: "uploaded",
      summary: "업로드 완료. 현재는 Mock 상태이며 추후 OCR/임베딩 파이프라인과 연동됩니다.",
      updatedAt: date,
    }));

    // 최신 업로드가 위에 보이도록 앞쪽에 삽입한다.
    set({ documents: [...created, ...get().documents] });
  },
}));
