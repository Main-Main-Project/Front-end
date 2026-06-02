import { create } from "zustand";

type Panel = "chat" | "documents" | "mypage";

type UiState = {
  panel: Panel;
  documentSearch: string;
  setPanel: (panel: Panel) => void;
  setDocumentSearch: (value: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  panel: "chat",
  documentSearch: "",
  // 사이드바에서 현재 우측 패널(채팅/문서함/마이페이지)을 전환한다.
  setPanel: (panel) => set({ panel }),
  // 문서함 검색어를 전역으로 보관해 레이아웃/문서 화면에서 함께 사용한다.
  setDocumentSearch: (value) => set({ documentSearch: value }),
}));
