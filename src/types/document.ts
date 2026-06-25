export type DocumentStatus =
    | "uploaded"
    | "ocr_done"
    | "chunked"
    | "embedded"
    | "ready"
    | "failed";

export type DocItem = {
    id: string;
    name: string;
    status: DocumentStatus;
    summary: string;
    uploadedAt: string;
    createdAt: string;
};