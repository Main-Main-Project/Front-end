import { create } from "zustand";
import { persist } from "zustand/middleware";

type Panel = "chat" | "documents" | "mypage";
type SidebarMode = "expanded" | "collapsed";

type UiState = {
  panel: Panel;
  documentSearch: string;
  sidebarMode: SidebarMode;
  recentChatsOpen: boolean;
  searchOverlayOpen: boolean;
  setPanel: (panel: Panel) => void;
  setDocumentSearch: (value: string) => void;
  setSidebarMode: (mode: SidebarMode) => void;
  toggleSidebar: () => void;
  setRecentChatsOpen: (open: boolean) => void;
  setSearchOverlayOpen: (open: boolean) => void;
  reset: () => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      panel: "chat",
      documentSearch: "",
      sidebarMode: "expanded",
      recentChatsOpen: false,
      searchOverlayOpen: false,

      setPanel: (panel) => set({ panel }),
      setDocumentSearch: (value) => set({ documentSearch: value }),
      setSidebarMode: (mode) => set({ sidebarMode: mode }),
      toggleSidebar: () =>
        set((state) => ({
          sidebarMode: state.sidebarMode === "expanded" ? "collapsed" : "expanded",
        })),
      setRecentChatsOpen: (open) => set({ recentChatsOpen: open }),
      setSearchOverlayOpen: (open) => set({ searchOverlayOpen: open }),

      reset: () =>
        set({
          panel: "chat",
          documentSearch: "",
          sidebarMode: "expanded",
          recentChatsOpen: false,
          searchOverlayOpen: false,
        }),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        sidebarMode: state.sidebarMode,
      }),
    }
  )
);