export type AdminDocumentStatus =
    | "uploaded"
    | "ocr_done"
    | "chunked"
    | "embedded"
    | "ready"
    | "failed";

export type AdminDocumentRow = {
    id: string;
    sessionId: string;
    userId: string;
    userName: string;
    name: string;
    status: AdminDocumentStatus;
    summary: string;
    uploadedAt: string;
    createdAt: string;
    failureReason?: string | null;
};