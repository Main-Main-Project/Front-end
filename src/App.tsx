import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { ChatLayout } from "@/layouts/ChatLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ChatPage } from "@/pages/ChatPage";
import { DocumentsPage } from "@/pages/DocumentsPage";
import { MyPage } from "@/pages/MyPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminDocumentsPage } from "@/pages/admin/AdminDocumentsPage";
import { AdminChatsPage } from "@/pages/admin/AdminChatsPage";
import { AdminSystemsPage } from "@/pages/admin/AdminSystemsPage";
import { useUiStore } from "@/stores/uiStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { ToastViewport } from "@/components/notifications/ToastViewport";

function ChatRouterPage() {
  const panel = useUiStore((s) => s.panel);
  if (panel === "documents") return <DocumentsPage />;
  if (panel === "mypage") return <MyPage />;
  return <ChatPage />;
}

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p className="text-sm text-mutedForeground">로딩 중...</p>
    </div>
  );
}

function ProtectedChatRoute() {
  const { isSignedIn, isHydrating, user } = useAuthStore();

  if (isHydrating) return <AuthLoadingScreen />;
  if (!isSignedIn) return <Navigate to="/signin" replace />;
  if (user?.userType === "ADMIN") return <Navigate to="/admin" replace />;

  return <ChatLayout />;
}

function ProtectedAdminRoute() {
  const { isSignedIn, isHydrating, user } = useAuthStore();

  if (isHydrating) return <AuthLoadingScreen />;
  if (!isSignedIn) return <Navigate to="/signin" replace />;
  if (user?.userType !== "ADMIN") return <Navigate to="/chat" replace />;

  return <AdminLayout />;
}

function RootRedirect() {
  const { isSignedIn, isHydrating, user } = useAuthStore();

  if (isHydrating) return <AuthLoadingScreen />;
  if (!isSignedIn) return <Navigate to="/signin" replace />;
  if (user?.userType === "ADMIN") return <Navigate to="/admin" replace />;

  return <Navigate to="/chat" replace />;
}

export default function App() {
  const hydrateUser = useAuthStore((s) => s.hydrateUser);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ToastViewport />

      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route path="/chat" element={<ProtectedChatRoute />}>
          <Route index element={<ChatRouterPage />} />
        </Route>

        <Route path="/admin" element={<ProtectedAdminRoute />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="documents" element={<AdminDocumentsPage />} />
          <Route path="chats" element={<AdminChatsPage />} />
          <Route path="systems" element={<AdminSystemsPage />} />
        </Route>
      </Routes>
    </div>
  );
}