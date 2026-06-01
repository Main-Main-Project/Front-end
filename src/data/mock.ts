export type ChatMessage = { id: string; role: "user" | "assistant"; content: string; createdAt: string };
export type ChatSession = { id: string; title: string; messages: ChatMessage[]; updatedAt: string };
export type DocumentStatus = "uploaded" | "ocr_done" | "chunked" | "embedded" | "ready" | "failed";
export type DocItem = { id: string; name: string; status: DocumentStatus; summary: string; updatedAt: string };

export const mockUser = { name: "홍길동", email: "hong@example.com", pushNotifications: true };

export const mockSessions: ChatSession[] = [
  {
    id: "s1",
    title: "전세 계약서 검토",
    updatedAt: "2026-05-31 09:12",
    messages: [
      { id: "m1", role: "user", content: "전세 계약서 특약 조항 검토해줘", createdAt: "09:10" },
      {
        id: "m2",
        role: "assistant",
        content: "특약 3조의 수선 의무 범위가 모호합니다. 임대인과 임차인 책임을 분리해 명시하는 것이 안전합니다.",
        createdAt: "09:11",
      },
    ],
  },
];

export const mockDocuments: DocItem[] = [
  {
    id: "d1",
    name: "lease_contract_v2.pdf",
    status: "ready",
    summary: "임대차 기간 2년, 중도해지 위약금 조항 포함. 보증금 반환 시점 명시 필요.",
    updatedAt: "2026-05-31",
  },
  {
    id: "d2",
    name: "nda_startup.docx",
    status: "embedded",
    summary: "기밀정보 범위가 광범위하며, 예외 조항이 부족합니다.",
    updatedAt: "2026-05-30",
  },
  {
    id: "d3",
    name: "labor_dispute_notes.txt",
    status: "failed",
    summary: "OCR 처리 실패. 원본 파일 이상 여부 확인 필요.",
    updatedAt: "2026-05-29",
  },
];

