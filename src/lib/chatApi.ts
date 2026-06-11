import { apiFetch } from "@/lib/apiClient";

export type SessionDto = {
    session_id: string;
    title: string;
    created_at: string;
    updated_at: string;
    last_message_at: string | null;
};

export type MessageDto = {
    message_id: string;
    session_id: string;
    user_id: string;
    question: string;
    answer: string | null;
    is_legal: boolean;
    question_at: string;
    answer_at: string | null;
};

export async function getSessions() {
    const response = await apiFetch("/chat/sessions");
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.detail ?? "세션 목록 조회에 실패했습니다.");
    }

    return data as SessionDto[];
}

export async function getMessages(sessionId: string) {
    const response = await apiFetch(`/chat/sessions/${sessionId}/messages`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.detail ?? "메시지 조회에 실패했습니다.");
    }

    return data as MessageDto[];
}