import { Navigate, Route, Routes } from "react-router-dom";
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

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/chat" element={<ChatLayout />}>
          <Route index element={<ChatRouterPage />} />
        </Route>
      </Routes>
    </div>
  );
}
