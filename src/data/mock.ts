export type UserType = "ADMIN" | "USER";
export type AppUser = { name: string; email: string; pushNotifications: boolean; userType: UserType };
export type ChatMessage = { id: string; role: "user" | "assistant"; content: string; createdAt: string };
export type ChatSession = { id: string; title: string; messages: ChatMessage[]; updatedAt: string };
export type DocumentStatus = "uploaded" | "ocr_done" | "chunked" | "embedded" | "ready" | "failed";
export type DocItem = { id: string; name: string; status: DocumentStatus; summary: string; updatedAt: string };
export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "dormant";
  userType: UserType;
  joinedAt: string;
};
export type AdminDocumentRow = DocItem & { owner: string; failureReason?: string | null };
export type AdminChatRow = {
  id: string;
  userName: string;
  question: string;
  answerPreview: string;
  answerBody: string;
  createdAt: string;
  answerTime: string;
};
export type AdminSystemStatus = {
  name: string;
  status: "healthy" | "degraded" | "offline";
  detail: string;
};
export type AdminActivityRow = {
  id: string;
  icon: "document" | "chat" | "user" | "alert";
  title: string;
  timestamp: string;
};
export type TrendPoint = { label: string; value: number };
export type FailureLogRow = { id: string; timestamp: string; item: string; reason: string };

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
    summary: "임대차 기간 2년, 중도해지 위약금 조항 포함. 보증금 반환 시점 명시가 더 필요합니다.",
    updatedAt: "2026-05-31",
  },
  {
    id: "d2",
    name: "nda_startup.docx",
    status: "embedded",
    summary: "기밀정보 범위가 넓고 예외 조항은 아직 보강이 필요합니다.",
    updatedAt: "2026-05-30",
  },
  {
    id: "d3",
    name: "labor_dispute_notes.txt",
    status: "failed",
    summary: "OCR 처리에 실패했습니다. 원본 파일 확인이 필요합니다.",
    updatedAt: "2026-05-29",
  },
];

export const mockAdminUsers: AdminUserRow[] = [
  { id: "u1", name: "관리자", email: "admin@mainmain.com", status: "active", userType: "ADMIN", joinedAt: "2026-06-01" },
  { id: "u2", name: "홍길동", email: "hong@example.com", status: "active", userType: "USER", joinedAt: "2026-05-31" },
  { id: "u3", name: "김철수", email: "kim@example.com", status: "active", userType: "USER", joinedAt: "2026-05-30" },
  { id: "u4", name: "이영희", email: "lee@example.com", status: "dormant", userType: "USER", joinedAt: "2026-05-28" },
  { id: "u5", name: "박민수", email: "park@example.com", status: "inactive", userType: "USER", joinedAt: "2026-05-26" },
];

export const mockAdminDocuments: AdminDocumentRow[] = [
  {
    id: "ad1",
    name: "근로기준법.pdf",
    status: "uploaded",
    summary: "업로드 완료. OCR 대기 중입니다.",
    updatedAt: "2026-06-08 14:32",
    owner: "홍길동",
    failureReason: null,
  },
  {
    id: "ad2",
    name: "민법.pdf",
    status: "ocr_done",
    summary: "텍스트 추출 완료. 청킹 단계가 다음 순서입니다.",
    updatedAt: "2026-06-08 14:25",
    owner: "김철수",
    failureReason: null,
  },
  {
    id: "ad3",
    name: "형법.pdf",
    status: "failed",
    summary: "OCR 추출 단계에서 실패했습니다.",
    updatedAt: "2026-06-08 14:15",
    owner: "이영희",
    failureReason: "스캔 해상도가 낮아 OCR 인식에 실패했습니다.",
  },
  {
    id: "ad4",
    name: "취업규칙.docx",
    status: "embedded",
    summary: "임베딩 벡터를 생성 중입니다.",
    updatedAt: "2026-06-08 14:10",
    owner: "박민수",
    failureReason: null,
  },
  {
    id: "ad5",
    name: "개인정보처리방침.pdf",
    status: "ready",
    summary: "파이프라인이 완료되어 검색 가능한 상태입니다.",
    updatedAt: "2026-06-08 13:55",
    owner: "홍길동",
    failureReason: null,
  },
];

export const mockAdminChats: AdminChatRow[] = [
  {
    id: "c1",
    userName: "홍길동",
    question: "근로계약서를 작성하지 않고 일하면 보호를 못 받나요?",
    answerPreview: "서면 근로계약서가 없어도 근로기준법상 보호를 받을 수 있지만, 근로조건 입증은 더 어려워질 수 있습니다.",
    answerBody:
      "근로계약서를 작성하지 않았더라도 실제 근로 제공이 있었다면 근로기준법상 보호 대상이 될 수 있습니다. 다만 임금, 근로시간, 휴게시간 같은 조건을 입증할 자료가 중요하므로 급여명세서, 출퇴근 기록, 메신저 대화, 업무 지시 내역을 함께 확보하는 것이 좋습니다.",
    createdAt: "2026-06-08 14:32",
    answerTime: "14:32",
  },
  {
    id: "c2",
    userName: "김철수",
    question: "연차수당은 어떻게 계산하나요?",
    answerPreview: "보통 미사용 연차 일수와 통상임금을 기준으로 산정하며, 퇴직 시 정산 시점도 함께 확인해야 합니다.",
    answerBody:
      "연차수당은 일반적으로 미사용 연차 일수에 1일 통상임금을 곱하는 방식으로 계산합니다. 다만 회사 취업규칙, 평균임금과 통상임금 판단, 발생 기준일에 따라 결과가 달라질 수 있어 근로계약서와 급여명세서를 함께 검토해야 합니다.",
    createdAt: "2026-06-08 14:28",
    answerTime: "14:28",
  },
  {
    id: "c3",
    userName: "이영희",
    question: "임대인이 통보 없이 보증금 반환을 미루는 게 가능한가요?",
    answerPreview: "정당한 법적 사유 없이 일방적으로 반환을 미루는 것은 분쟁 소지가 크며 계약 조항과 퇴거 시점 검토가 필요합니다.",
    answerBody:
      "보증금 반환은 계약 종료, 원상회복 여부, 동시이행 관계 등을 함께 봐야 합니다. 임대인이 일방적으로 반환을 지연하는 경우에는 계약서, 문자 통보 내용, 퇴거 일자, 열쇠 반환 여부 등을 기준으로 대응 전략을 세우는 것이 좋습니다.",
    createdAt: "2026-06-08 14:25",
    answerTime: "14:25",
  },
  {
    id: "c4",
    userName: "박민수",
    question: "부당해고를 입증하려면 어떤 자료가 필요한가요?",
    answerPreview: "해고 통지, 대화 기록, 출퇴근 내역, 임금 자료처럼 고용관계를 보여주는 자료가 중요합니다.",
    answerBody:
      "부당해고 여부는 해고 통지 방식, 사유의 정당성, 절차 준수 여부를 함께 봐야 합니다. 해고 통지서, 메신저 대화, 인사 공지, 출근 기록, 임금 지급 내역 같은 자료를 확보해 두는 것이 매우 중요합니다.",
    createdAt: "2026-06-08 14:20",
    answerTime: "14:20",
  },
];

export const mockAdminSystems: AdminSystemStatus[] = [
  { name: "백엔드", status: "healthy", detail: "응답 시간 120ms" },
  { name: "데이터베이스", status: "healthy", detail: "정상 연결됨" },
  { name: "Ollama", status: "healthy", detail: "모델 로드 완료" },
  { name: "벡터 DB", status: "degraded", detail: "인덱스 동기화 지연 8초" },
];

export const mockQuestionTrend: TrendPoint[] = [
  { label: "월", value: 220 },
  { label: "화", value: 240 },
  { label: "수", value: 480 },
  { label: "목", value: 650 },
  { label: "금", value: 700 },
  { label: "토", value: 660 },
  { label: "일", value: 900 },
];

export const mockAdminActivities: AdminActivityRow[] = [
  { id: "a1", icon: "document", title: "홍길동 님이 근로기준법.pdf를 업로드했습니다.", timestamp: "2026-06-08 14:32" },
  { id: "a2", icon: "chat", title: "김철수 님이 새 법률 질문을 입력했습니다.", timestamp: "2026-06-08 14:28" },
  { id: "a3", icon: "document", title: "이영희 님의 문서 처리가 완료되었습니다.", timestamp: "2026-06-08 14:25" },
  { id: "a4", icon: "user", title: "관리자가 사용자 권한을 수정했습니다.", timestamp: "2026-06-08 14:20" },
  { id: "a5", icon: "alert", title: "벡터 DB 동기화 지연이 경고 임계치를 넘었습니다.", timestamp: "2026-06-08 14:15" },
];

export const mockFailureLogs: FailureLogRow[] = [
  { id: "f1", timestamp: "2026-06-08 14:15", item: "형법.pdf", reason: "OCR 추출 실패" },
  { id: "f2", timestamp: "2026-06-08 14:10", item: "개인정보스캔본.pdf", reason: "지원하지 않는 이미지 프로필" },
  { id: "f3", timestamp: "2026-06-08 14:05", item: "급여규정.pdf", reason: "임베딩 작업 시간 초과" },
  { id: "f4", timestamp: "2026-06-08 14:00", item: "취업규칙.docx", reason: "청킹 생성 실패" },
];
