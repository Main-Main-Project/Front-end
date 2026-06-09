import { useMemo, useState } from "react";
import {
  ActivitySquare,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  LucideIcon, 
  Menu,
  MessageSquare,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

type AdminNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

const adminNavItems: AdminNavItem[] = [
  { to: "/admin", label: "대시보드", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "사용자 관리", icon: Users },
  { to: "/admin/documents", label: "문서 관리", icon: FileText },
  { to: "/admin/chats", label: "채팅 모니터링", icon: MessageSquare },
  { to: "/admin/systems", label: "시스템 상태", icon: ActivitySquare },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const signout = useAuthStore((s) => s.signout);
  const navigate = useNavigate();
  const location = useLocation();

  const currentTitle = useMemo(() => {
    const found = adminNavItems.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    );
    return found?.label ?? "대시보드";
  }, [location.pathname]);

  const handleSignout = () => {
    signout();
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-[linear-gradient(180deg,#0f172a_0%,#0f1d3b_50%,#122042_100%)] px-5 py-6 text-white shadow-2xl transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Shield className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">RAG Admin</p>
              <p className="text-xs text-slate-300">운영 센터</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setSidebarOpen(false)} aria-label="사이드바 닫기">
            <X className="size-4" />
          </Button>
        </div>

        <nav className="mt-10 space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end ?? false}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-[linear-gradient(135deg,#2563eb_0%,#3b82f6_60%,#60a5fa_100%)] text-white shadow-lg shadow-blue-900/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )
                }
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold">
              {user?.name?.slice(0, 1) ?? "관"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name ?? "관리자"}</p>
              <p className="truncate text-xs text-slate-300">{user?.email ?? "admin@mainmain.com"}</p>
            </div>
          </div>
          <Button variant="ghost" className="mt-4 w-full justify-start text-white hover:bg-white/10" onClick={handleSignout}>
            <LogOut className="mr-2 size-4" />
            로그아웃
          </Button>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          className="fixed inset-0 z-40 bg-slate-950/35"
          onClick={() => setSidebarOpen(false)}
          aria-label="사이드바 배경 닫기"
        />
      ) : null}

      <div>
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
          <div className="flex items-center gap-4 px-4 py-4 md:px-6">
            <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)} aria-label="관리자 메뉴 열기">
              <Menu className="size-4" />
            </Button>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Admin Panel</p>
              <h1 className="truncate text-xl font-semibold text-slate-900">{currentTitle}</h1>
            </div>

            <div className="hidden max-w-sm flex-1 md:block">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="사용자, 문서, 로그 검색" className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-11" />
              </div>
            </div>

            <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:text-slate-800">
              <Bell className="size-5" />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500" />
            </button>

            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 md:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700">
                {user?.name?.slice(0, 1) ?? "관"}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{user?.name ?? "관리자"}</p>
                <p className="text-xs text-slate-500">관리자 계정</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-6">
          <div className="mx-auto max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
