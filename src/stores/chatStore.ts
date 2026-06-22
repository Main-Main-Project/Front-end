import { create } from "zustand";
import { getSessionTotal, getSessions } from "@/lib/chatApi";
import { connectChatSocket } from "@/lib/chatSocket";
import { showToast } from "@/stores/notificationStore";

type UploadedAttachment = {
  name: string;
  extension: string;
};

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  pending?: boolean;
  attachments?: UploadedAttachment[];
};

type UiSession = {
  id: string;
  title: string;
  updatedAt: string;
};

const sortSessionsByUpdatedAt = (sessions: UiSession[]) =>
  [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

type ChatState = {
  sessions: UiSession[];
  messagesBySession: Record<string, UiMessage[]>;
  pendingNewChatMessages: UiMessage[];
  activeSessionId: string | null;
  draft: string;
  socket: WebSocket | null;
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  
  touchSession: (sessionId: string) => void;
  appendLocalMessage: (sessionId: string, message: UiMessage) => void;
  setDraft: (draft: string) => void;
  loadSessions: () => Promise<void>;
  loadMessages: (sessionId: string) => Promise<void>;
  startNewChat: () => void;
  selectSession: (sessionId: string) => Promise<void>;
  registerSession: (session: UiSession) => void;
  connectSocket: (sessionId?: string) => Promise<void>;
  disconnectSocket: () => void;
  sendMessage: () => Promise<void>;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  messagesBySession: {},
  pendingNewChatMessages: [],
  activeSessionId: null,
  draft: "",
  socket: null,
  isLoadingSessions: false,
  isLoadingMessages: false,
  isSending: false,

  setDraft: (draft) => set({ draft }),

  touchSession: (sessionId) =>
  set((state) => ({
    sessions: sortSessionsByUpdatedAt(
      state.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, updatedAt: new Date().toISOString() }
          : session
      )
    ),
  })),

appendLocalMessage: (sessionId, message) =>
  set((state) => ({
    messagesBySession: {
      ...state.messagesBySession,
      [sessionId]: [...(state.messagesBySession[sessionId] ?? []), message],
    },
  })),

  loadSessions: async () => {
    set({ isLoadingSessions: true });

    try {
      const data = await getSessions();

      set({
        sessions: sortSessionsByUpdatedAt(
          data.map((item) => ({
            id: item.session_id,
            title: item.title,
            updatedAt: item.updated_at,
          }))
        ),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "세션 목록을 불러오지 못했습니다.";

      showToast({
        title: "채팅 세션 조회 실패",
        description: message,
        tone: "error",
      });
    } finally {
      set({ isLoadingSessions: false });
    }
  },

  loadMessages: async (sessionId) => {
    set({ isLoadingMessages: true });

    try {
      const data = await getSessionTotal(sessionId);

      const uiMessages : UiMessage[] = data.flatMap((item) => {
        if (item.type === "message") {
          const msg = item.message;

          const messages: UiMessage[] = [
            {
              id: `${msg.message_id}-question`,
              role: "user",
              content: msg.question,
              createdAt: msg.question_at,
            },
          ];

          if (msg.answer) {
            messages.push({
              id: `${msg.message_id}-answer`,
              role: "assistant",
              content: msg.answer,
              createdAt: msg.answer_at ?? msg.question_at,
            });
          }

          return messages;
        }

        if (item.type === "document") {
          const doc = item.document;
          const extension = doc.file_name.split(".").pop()?.toLowerCase() ?? "";

          const documentMessage: UiMessage = {
            id: `${doc.document_id}-document`,
            role: "user",
            content: "",
            createdAt: doc.created_at,
            attachments: [
              {
                name: doc.file_name,
                extension,
              },
            ],
          };

          return [documentMessage];
        }

        return [];
      });

      set((state) => ({
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId]: uiMessages,
        },
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "메시지를 불러오지 못했습니다.";

      showToast({
        title: "메시지 조회 실패",
        description: message,
        tone: "error",
      });
    } finally {
      set({ isLoadingMessages: false });
    }
  },

    registerSession: (session) => {
    const { socket } = get();
    socket?.close();

    set((state) => {
      const nextSessions = [
        session,
        ...state.sessions.filter((item) => item.id !== session.id),
      ];

      return {
        activeSessionId: session.id,
        socket: null,
        sessions: sortSessionsByUpdatedAt(nextSessions),
        messagesBySession: {
          ...state.messagesBySession,
          [session.id]: state.messagesBySession[session.id] ?? [],
        },
        pendingNewChatMessages: [],
        isSending: false,
      };
    });
  },

  startNewChat: () => {
    const { socket } = get();
    socket?.close();

    set({
      activeSessionId: null,
      pendingNewChatMessages: [],
      draft: "",
      socket: null,
      isSending: false,
    });
  },

  selectSession: async (sessionId) => {
    const { disconnectSocket, loadMessages, connectSocket } = get();

    disconnectSocket();
    set({ activeSessionId: sessionId });

    await loadMessages(sessionId);
    await connectSocket(sessionId);
  },

  connectSocket: async (sessionId) => {
    const { disconnectSocket } = get();

    disconnectSocket();

    try {
      const socket = connectChatSocket(sessionId);

      await new Promise<void>((resolve, reject) => {
        socket.onopen = () => {
          set({ socket });
          resolve();
        };

        socket.onerror = () => {
          reject(new Error("웹소켓 연결 중 문제가 발생했습니다."));
        };
      });

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "session_created") {
            set((state) => {
              const nextSessions = [
                {
                  id: data.session_id,
                  title: data.title,
                  updatedAt: data.created_at ?? new Date().toISOString(),
                },
                ...state.sessions.filter((item) => item.id !== data.session_id),
              ];

              return {
                activeSessionId: data.session_id,
                sessions: sortSessionsByUpdatedAt(nextSessions),
                messagesBySession: {
                  ...state.messagesBySession,
                  [data.session_id]: state.pendingNewChatMessages.map((message) => ({
                    ...message,
                    pending: false,
                  })),
                },
                pendingNewChatMessages: [],
              };
            });
            return;
          }

          if (data.type === "message") {
            set((state) => {
              const targetSessionId = data.session_id ?? state.activeSessionId;

              if (!targetSessionId) {
                return { isSending: false };
              }

              const existingMessages = state.messagesBySession[targetSessionId] ?? [];
              const normalizedMessages = existingMessages.map((message) =>
                message.pending ? { ...message, pending: false } : message
              );

              const hasSameQuestion = normalizedMessages.some(
                (message) =>
                  message.role === "user" &&
                  message.content === data.question
              );

              const nextSessions = state.sessions.map((session) =>
                session.id === targetSessionId
                  ? {
                      ...session,
                      updatedAt:
                        data.answer_at ??
                        data.question_at ??
                        new Date().toISOString(),
                    }
                  : session
              );

              return {
                messagesBySession: {
                  ...state.messagesBySession,
                  [targetSessionId]: [
                    ...normalizedMessages,
                    ...(!hasSameQuestion
                      ? [
                          {
                            id: `${data.message_id}-question`,
                            role: "user" as const,
                            content: data.question ?? "",
                            createdAt: data.question_at ?? new Date().toISOString(),
                          },
                        ]
                      : []),
                    {
                      id: `${data.message_id}-answer`,
                      role: "assistant" as const,
                      content: data.answer ?? "",
                      createdAt: data.answer_at ?? new Date().toISOString(),
                    },
                  ],
                },
                sessions: sortSessionsByUpdatedAt(nextSessions),
                isSending: false,
              };
            });
            return;
          }

          if (data.type === "error") {
            set({ isSending: false });

            showToast({
              title: "채팅 오류",
              description: data.message ?? "채팅 중 오류가 발생했습니다.",
              tone: "error",
            });
          }
        } catch {
          set({ isSending: false });

          showToast({
            title: "응답 처리 실패",
            description: "웹소켓 응답을 해석하지 못했습니다.",
            tone: "error",
          });
        }
      };

      socket.onclose = () => {
        set((state) => (state.socket === socket ? { socket: null } : state));
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "웹소켓 연결에 실패했습니다.";

      set({ socket: null, isSending: false });

      showToast({
        title: "웹소켓 연결 실패",
        description: message,
        tone: "error",
      });
    }
  },

  disconnectSocket: () => {
    const { socket } = get();
    socket?.close();
    set({ socket: null });
  },
  
  reset: () => {
    const { socket } = get();
    socket?.close();

    set({
      sessions: [],
      messagesBySession: {},
      pendingNewChatMessages: [],
      activeSessionId: null,
      draft: "",
      socket: null,
      isLoadingSessions: false,
      isLoadingMessages: false,
      isSending: false,
    });
  },

  sendMessage: async () => {
    const { draft, activeSessionId, socket, connectSocket } = get();
    const text = draft.trim();

    if (!text) return;

    const userMessage: UiMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    if (activeSessionId) {
      set({
        draft: "",
        isSending: true,
      });
    } else {
      set((state) => ({
        draft: "",
        isSending: true,
        pendingNewChatMessages: [...state.pendingNewChatMessages, userMessage],
      }));
    }

    let currentSocket = socket;

    if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) {
      await connectSocket(activeSessionId ?? undefined);
      currentSocket = get().socket;
    }

    if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) {
      set({ isSending: false });

      showToast({
        title: "메시지 전송 실패",
        description: "웹소켓 연결이 아직 준비되지 않았습니다.",
        tone: "error",
      });
      return;
    }

    currentSocket.send(
      JSON.stringify({
        message: text,
      })
    );
  },
}));