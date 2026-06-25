import { apiFetch } from "@/lib/apiClient";

export type SessionDto = {
    session_id: string;
    title: string;
    created_at: string;
    updated_at: string;
    last_message_at: string | null;
};

export type CreatedSessionDto = {
    session_id: string;
    title: string;
    created_at: string;
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

export type UploadedDocumentDto = {
    document_id: string;
    session_id: string;
    user_id: string;
    file_name: string;
    file_ext: "PPT" | "PDF" | "HWP" | "DOCX" | "XLSX" | "TXT";
    file_size_bytes: number | null;
    storage_url: string;
    status: "UPLOADED" | "OCR_DONE" | "CHUNKED" | "EMBEDDED" | "READY" | "FAILED";
    summary: string;
    created_at: string;
};

export type TotalMessageItemDto = {
    type: "message";
    created_at: string;
    message: MessageDto;
};

export type TotalDocumentItemDto = {
    type: "document";
    created_at: string;
    document: UploadedDocumentDto;
};

export type TotalItemDto = TotalMessageItemDto | TotalDocumentItemDto;

export async function createSession() {
    const response = await apiFetch("/chat/session", {
        method: "POST",
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.detail ?? "세션 생성에 실패했습니다.");
    }

    return data as CreatedSessionDto;
}

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

export async function getSessionTotal(sessionId: string) {
    const response = await apiFetch(`/chat/sessions/${sessionId}/total`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.detail ?? "세션 전체 이력을 불러오지 못했습니다.");
    }

    return data as TotalItemDto[];
}

export async function uploadDocument(sessionId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiFetch(`/chat/sessions/${sessionId}/upload`, {
        method: "POST",
        body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.detail ?? "문서 업로드에 실패했습니다.");
    }

    return data as UploadedDocumentDto;
}

export async function getDocuments(sessionId: string) {
    const response = await apiFetch(`/chat/sessions/${sessionId}/documents`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.detail ?? "문서 목록 조회에 실패했습니다.");
    }

    return data as UploadedDocumentDto[];
}

export type DeleteDocumentResponseDto = {
    message: string;
    chat_session_deleted: boolean;
};

export async function deleteMyDocument(documentId: string) {
    const response = await apiFetch(`/chat/${documentId}/document`, {
        method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.detail ?? "문서 삭제에 실패했습니다.");
    }

    return data as DeleteDocumentResponseDto;
}

export async function getMyDocuments() {
    const response = await apiFetch("/chat/documents");
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.detail ?? "문서함 조회에 실패했습니다.");
    }

    return data as UploadedDocumentDto[];
}

export async function getAdminDocuments() {
    const response = await apiFetch("/admin/documents");
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.detail ?? "관리자 문서 목록 조회에 실패했습니다.");
    }

    return data as UploadedDocumentDto[];
}

export async function deleteAdminDocument(documentId: string) {
    const response = await apiFetch(`/admin/${documentId}/document`, {
        method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.detail ?? "관리자 문서 삭제에 실패했습니다.");
    }

    return data as DeleteDocumentResponseDto;
}