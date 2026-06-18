
export type AttachmentMeta = {
    label: string;
    bgClass: string;
};

export const DEFAULT_ATTACHMENT_META: AttachmentMeta = {
    label: "문서",
    bgClass: "bg-blue-500",
};

export const ATTACHMENT_META: Record<string, AttachmentMeta> = {
    pdf: { label: "PDF", bgClass: "bg-red-500" },
    hwp: { label: "HWP", bgClass: "bg-emerald-500" },
    hwpx: { label: "HWP", bgClass: "bg-emerald-500" },
    docx: { label: "DOCX", bgClass: "bg-blue-500" },
    ppt: { label: "PPT", bgClass: "bg-orange-500" },
    pptx: { label: "PPT", bgClass: "bg-orange-500" },
    xlsx: { label: "XLSX", bgClass: "bg-green-600" },
    txt: { label: "TXT", bgClass: "bg-zinc-500" },
};

export function getAttachmentMeta(extension: string) {
    return ATTACHMENT_META[extension] ?? DEFAULT_ATTACHMENT_META;
}