# Legal Advisor UI

법률 문서 검토와 법률 질의응답을 지원하는 **AI 법률 상담 서비스 프론트엔드**입니다.  
사용자는 계약서, 근로계약서, 전세 계약서 등 법률 관련 문서를 업로드하거나 질문을 입력하여 상담을 받을 수 있으며, 관리자는 사용자 현황, 문서 처리 상태, 채팅 로그, 시스템 상태를 한 화면에서 확인할 수 있습니다.

<br />

## 프로젝트 개요

이 프로젝트는 법률 상담 챗봇 서비스를 위한 프론트엔드 UI입니다.

사용자 화면에서는 법률 질문 입력, 채팅 세션 관리, 문서 업로드 및 문서함 확인, 마이페이지 기능을 제공합니다.  
관리자 화면에서는 서비스 운영을 위한 대시보드, 사용자 관리, 문서 처리 현황, 채팅 모니터링, 시스템 상태 확인 기능을 제공합니다.

<br />

## 주요 기능

### 사용자 기능

- 회원가입 및 로그인
- JWT 기반 인증 상태 관리
- 일반 사용자 / 관리자 권한별 라우팅 분리
- 법률 질문 입력 및 AI 답변 채팅 UI
- 채팅 세션 목록 조회 및 이전 대화 확인
- 문서 업로드
- 문서 검색 및 문서 요약 확인
- 마이페이지에서 계정 정보 및 알림 설정 관리
- 로그아웃 및 회원 탈퇴

### 관리자 기능

- 전체 사용자 수, 질문 수, 업로드 문서 수, 실패 건수 확인
- 최근 7일 질문 수 추이 확인
- 최근 활동 로그 확인
- 백엔드, 데이터베이스, LLM, 벡터 DB 상태 확인
- 사용자 관리
- 문서 처리 상태 관리
- 채팅 모니터링
- 시스템 상태 확인

<br />

## 화면 구성

### 로그인 / 회원가입

| 로그인 | 회원가입 |
| --- | --- |
| <img width="2880" height="1800" alt="login" src="https://github.com/user-attachments/assets/d8515142-db6a-4f2c-b338-b4237efd3ee0" /> | <img width="2880" height="1800" alt="signup" src="https://github.com/user-attachments/assets/5ddd0e94-1ad4-4143-8bc6-0cfa146fb20e" /> |

<br />

### 채팅 화면

| 새 대화 화면 | 채팅 진행 화면 |
| --- | --- |
| <img width="2880" height="1800" alt="main_새창" src="https://github.com/user-attachments/assets/c9420d34-d689-40d3-83ab-8a31ef0665fb" /> | <img width="2880" height="1800" alt="main_채팅창" src="https://github.com/user-attachments/assets/409a0f74-8630-4682-bd06-87fbc98bf32f" /> |

<br />

### 마이페이지

| 계정 설정 화면 |
| --- |
| <img width="2880" height="1800" alt="마이페이지창" src="https://github.com/user-attachments/assets/0d544ad2-89a9-418b-9004-4ccdd29a865c" /> |

<br />

### 관리자 대시보드

| 관리자 대시보드 |
| --- |
| <img width="2880" height="1800" alt="관리자 이미지" src="https://github.com/user-attachments/assets/edbd24bc-9be2-46e4-ad51-0624b262e894" /> |

<br />

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Language | TypeScript |
| Framework | React |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| State Management | Zustand |
| UI Component | Radix UI, Lucide React |
| API 통신 | Fetch API |
| Realtime | WebSocket |
| Deployment | Docker |

<br />

## 프로젝트 구조

```txt
Front-end/
├─ public/
├─ src/
│  ├─ components/
│  │  ├─ notifications/
│  │  ├─ ui/
│  │  ├─ AuthAnimated.tsx
│  │  └─ auth-animated.css
│  │
│  ├─ data/
│  │  └─ mock.ts
│  │
│  ├─ layouts/
│  │  ├─ AdminLayout.tsx
│  │  └─ ChatLayout.tsx
│  │
│  ├─ lib/
│  │  ├─ apiClient.ts
│  │  ├─ authApi.ts
│  │  ├─ chatApi.ts
│  │  ├─ chatSocket.ts
│  │  ├─ tokenStorage.ts
│  │  ├─ userApi.ts
│  │  └─ utils.ts
│  │
│  ├─ pages/
│  │  ├─ admin/
│  │  │  ├─ AdminDashboardPage.tsx
│  │  │  ├─ AdminUsersPage.tsx
│  │  │  ├─ AdminDocumentsPage.tsx
│  │  │  ├─ AdminChatsPage.tsx
│  │  │  └─ AdminSystemsPage.tsx
│  │  │
│  │  ├─ ChatPage.tsx
│  │  ├─ DocumentsPage.tsx
│  │  ├─ MyPage.tsx
│  │  ├─ SignInPage.tsx
│  │  └─ SignUpPage.tsx
│  │
│  ├─ stores/
│  │  ├─ authStore.ts
│  │  ├─ chatStore.ts
│  │  ├─ documentStore.ts
│  │  ├─ notificationStore.ts
│  │  └─ uiStore.ts
│  │
│  ├─ types/
│  │  └─ notification.ts
│  │
│  ├─ App.tsx
│  ├─ index.css
│  └─ main.tsx
│
├─ Dockerfile
├─ package.json
├─ tailwind.config.ts
├─ vite.config.ts
└─ README.md
