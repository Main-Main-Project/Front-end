import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { ChatLayout } from "@/layouts/ChatLayout";
import { ChatPage } from "@/pages/ChatPage";
import { DocumentsPage } from "@/pages/DocumentsPage";
import { MyPage } from "@/pages/MyPage";
import { useUiStore } from "@/stores/uiStore";

function ChatRouterPage() {
  const panel = useUiStore((s) => s.panel);
  if (panel === "documents") return <DocumentsPage />;
  if (panel === "mypage") return <MyPage />;
  return <ChatPage />;
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isSignedIn = useAuthStore((s) => s.isSignedIn);

  if (!isSignedIn) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

export default function App() {
  const hydrateUser = useAuthStore((s) => s.hydrateUser);

  useEffect(() => {
    // 앱이 처음 뜰 때 localStorage의 토큰으로 사용자 정보를 복원한다
    hydrateUser();
  }, [hydrateUser]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ChatRouterPage />} />
        </Route>
      </Routes>
    </div>
  );
}