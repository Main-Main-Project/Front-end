import { create } from "zustand";
import { mockSessions, type ChatSession } from "@/data/mock";

type ChatState = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  draft: string;
  setDraft: (draft: string) => void;
  startNewChat: () => void;
  selectSession: (id: string) => void;
  sendMessage: () => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: mockSessions,
  activeSessionId: mockSessions[0]?.id ?? null,
  draft: "",
  setDraft: (draft) => set({ draft }),
  startNewChat: () => set({ activeSessionId: null, draft: "" }),
  selectSession: (id) => set({ activeSessionId: id }),
  sendMessage: () => {
    const { draft, activeSessionId, sessions } = get();
    // 공백 전송은 무시한다.
    if (!draft.trim()) return;

    const newUserMessage = { id: crypto.randomUUID(), role: "user" as const, content: draft, createdAt: "방금 전" };
    const newAssistantMessage = {
      id: crypto.randomUUID(),
      role: "assistant" as const,
      content: "현재는 Mock 응답입니다. 백엔드 연동 전 UI/UX 검증용 메시지입니다.",
      createdAt: "방금 전",
    };

    if (!activeSessionId) {
      // 아직 세션이 없으면 첫 메시지로 새 세션을 생성한다.
      const created: ChatSession = {
        id: crypto.randomUUID(),
        title: draft.slice(0, 18),
        updatedAt: "방금 전",
        messages: [newUserMessage, newAssistantMessage],
      };
      set({ sessions: [created, ...sessions], activeSessionId: created.id, draft: "" });
      return;
    }

    // 기존 세션이면 활성 세션의 메시지 배열만 append 한다.
    set({
      sessions: sessions.map((s) =>
        s.id === activeSessionId
          ? { ...s, updatedAt: "방금 전", messages: [...s.messages, newUserMessage, newAssistantMessage] }
          : s
      ),
      draft: "",
    });
  },
}));

