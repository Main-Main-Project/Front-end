import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  FileText,
  MessageSquarePlus,
  Settings2,
  UserRound,
  PanelLeftClose,
  PanelLeftOpen,
  MessageCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chatStore";
import { useUiStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDaysDiff(from: Date, to: Date) {
  const fromDate = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const toDate = new Date(to.getFullYear(), to.getMonth(), to.getDate());

  return Math.floor((toDate.getTime() - fromDate.getTime()) / 86400000);
}

export function ChatLayout() {
  const { sessions, activeSessionId, selectSession, startNewChat } = useChatStore();
  const {
    panel,
    setPanel,
    chatSearchQuery,
    setChatSearchQuery,
    sidebarMode,
    toggleSidebar,
    recentChatsOpen,
    setRecentChatsOpen,
    searchOverlayOpen,
    setSearchOverlayOpen,
  } = useUiStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const collapsed = sidebarMode === "collapsed";
  const [logoHovered, setLogoHovered] = useState(false);

  const recentChatsButtonRef = useRef<HTMLButtonElement | null>(null);
  const recentChatsPopoverRef = useRef<HTMLDivElement | null>(null);
  const recentSessions = sessions.slice(0, 10);

  const searchedSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(chatSearchQuery.trim().toLowerCase())
  );

  const today = new Date();

  const todaySessions = searchedSessions
    .filter((session) => isSameDay(new Date(session.updatedAt), today))
    .slice(0, 5);

  const yesterdaySessions = searchedSessions
    .filter((session) => getDaysDiff(new Date(session.updatedAt), today) === 1)
    .slice(0, 5);

  const last7DaysSessions = searchedSessions
    .filter((session) => {
      const diff = getDaysDiff(new Date(session.updatedAt), today);
      return diff >= 2 && diff <= 7;
    })
    .slice(0, 5);

    const goToFreshChat = () => {
      setPanel("chat");
      startNewChat();
      navigate("/chat");
    };

    const openSession = (sessionId: string) => {
      setPanel("chat");
      setRecentChatsOpen(false);
      setSearchOverlayOpen(false);
      navigate(`/chat/${sessionId}`);
      void selectSession(sessionId);
    };

    useEffect(() => {
      if (!recentChatsOpen) return;

      const handlePointerDown = (event: MouseEvent) => {
        const target = event.target as Node;

        const clickedButton =
          recentChatsButtonRef.current?.contains(target) ?? false;

        const clickedPopover =
          recentChatsPopoverRef.current?.contains(target) ?? false;

        if (!clickedButton && !clickedPopover) {
          setRecentChatsOpen(false);
        }
      };

      document.addEventListener("mousedown", handlePointerDown);

      return () => {
        document.removeEventListener("mousedown", handlePointerDown);
      };
    }, [recentChatsOpen, setRecentChatsOpen]);

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={cn(
          "relative hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-300 ease-in-out md:flex",
          collapsed ? "w-[72px]" : "w-[300px]"
        )}
      >
        <div
          className={cn(
            "transition-all duration-300",
            collapsed
              ? "flex flex-col items-center gap-3 p-3"
              : "flex items-center justify-between p-4"
          )}
        >
          <div className="relative group">
            <button
              onClick={collapsed ? toggleSidebar : goToFreshChat}
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
              className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-muted"
            >
              {collapsed && logoHovered ? (
                <PanelLeftOpen className="size-5" />
              ) : (
                <img src="/favicon.svg" alt="logo" className="h-6 w-6" />
              )}
            </button>

            {collapsed && (
              <div className="pointer-events-none absolute left-16 top-1/2 z-30 -translate-y-1/2 -translate-x-1 rounded-xl bg-zinc-800 px-3 py-2 text-sm font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                사이드바 열기
              </div>
            )}
          </div>

          {collapsed ? (
            <>
              <div className="relative group">
                <Button variant="ghost" size="icon" onClick={goToFreshChat}>
                  <MessageSquarePlus className="size-5" />
                </Button>
                <div className="pointer-events-none absolute left-16 top-1/2 z-30 -translate-y-1/2 -translate-x-1 rounded-xl bg-zinc-800 px-3 py-2 text-sm font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                  새 채팅
                </div>
              </div>

              <div className="relative group">
                <Button variant="ghost" size="icon" onClick={() => setSearchOverlayOpen(true)}>
                  <Search className="size-5" />
                </Button>
                <div className="pointer-events-none absolute left-16 top-1/2 z-30 -translate-y-1/2 -translate-x-1 rounded-xl bg-zinc-800 px-3 py-2 text-sm font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                  검색
                </div>
              </div>

              <div className="relative group">
                <Button
                  ref={recentChatsButtonRef}
                  variant="ghost"
                  size="icon"
                  onClick={() => setRecentChatsOpen(!recentChatsOpen)}
                >
                  <MessageCircle className="size-5" />
                </Button>
                <div className="pointer-events-none absolute left-16 top-1/2 z-30 -translate-y-1/2 -translate-x-1 rounded-xl bg-zinc-800 px-3 py-2 text-sm font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                  최근 채팅
                </div>
              </div>
            </>
          ) : (
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label="사이드바 닫기"
              >
                <PanelLeftClose className="size-4" />
              </Button>

              <div className="pointer-events-none absolute right-14 top-1/2 z-30 -translate-y-1/2 translate-x-1 rounded-xl bg-zinc-800 px-3 py-2 text-sm font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                사이드바 닫기
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            collapsed
              ? "max-h-0 px-0 pb-0 opacity-0 pointer-events-none"
              : "max-h-40 px-4 pb-3 opacity-100"
          )}
        >
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={panel === "chat" ? "default" : "outline"}
              size="sm"
              onClick={() => setPanel("chat")}
            >
              채팅
            </Button>
            <Button
              variant={panel === "documents" ? "default" : "outline"}
              size="sm"
              onClick={() => setPanel("documents")}
            >
              <FileText className="mr-1 size-3" />
              문서함
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setSearchOverlayOpen(true)}
            className="relative mt-3 flex h-9 w-full items-center rounded-lg border border-input bg-background px-3 text-left text-sm text-mutedForeground transition hover:bg-muted"
          >
            <Search className="mr-2 size-4 shrink-0" />
            <span className="truncate">채팅 검색</span>
          </button>
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 overflow-hidden transition-opacity duration-200",
            collapsed ? "pointer-events-none opacity-0" : "opacity-100"
          )}
        >
          <ScrollArea className="h-full px-2">
            <div className="space-y-1 pb-4">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => openSession(session.id)}
                  className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                    activeSessionId === session.id
                      ? "bg-accent text-accentForeground"
                      : "text-mutedForeground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  {session.title === "__uploading__" ? (
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  ) : (
                    <p className="truncate font-medium">{session.title}</p>
                  )}
                  <p className="mt-1 text-xs opacity-80">{session.updatedAt}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            collapsed
              ? "max-h-0 opacity-0 pointer-events-none"
              : "max-h-32 opacity-100"
          )}
        >
          <Separator />

          <div className="flex items-center gap-3 p-4">
            <Avatar>
              <AvatarFallback>
                <UserRound className="size-4" />
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              {user ? (
                <>
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-mutedForeground">{user.email}</p>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                </div>
              )}
            </div>

            <Button
              variant={panel === "mypage" ? "secondary" : "ghost"}
              size="icon"
              aria-label="설정"
              onClick={() => setPanel("mypage")}
            >
              <Settings2 className="size-4" />
            </Button>
          </div>
        </div>

        <div
          ref={recentChatsPopoverRef}
          className={cn(
            "absolute left-[84px] top-24 z-20 w-72 rounded-2xl border border-border bg-card p-3 shadow-xl transition-all duration-200",
            recentChatsOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-2 opacity-0 pointer-events-none"
          )}
        >
          <p className="mb-3 text-sm font-semibold">최근 채팅</p>
          <div className="space-y-1">
            {recentSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => openSession(session.id)}
                className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
              >
                {session.title === "__uploading__" ? (
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="truncate">{session.title}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1">
        <Outlet />
      </main>
      {searchOverlayOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setSearchOverlayOpen(false)}
        >
          <div
            className="mx-auto mt-24 flex h-[440px] w-[678px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#2f2f2f] text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
              <Search className="size-4 text-white/60" />
              <input
                autoFocus
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                placeholder="채팅 검색..."
                className="flex-1 bg-transparent text-lg outline-none placeholder:text-white/35"
              />
              <button
                onClick={() => setSearchOverlayOpen(false)}
                className="text-xl leading-none text-white/60 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="search-overlay-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <button
                onClick={() => {
                  goToFreshChat();
                  setSearchOverlayOpen(false);
                }}
                className="mb-6 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-white/5"
              >
                <MessageSquarePlus className="size-5" />
                새 채팅
              </button>

              {todaySessions.length > 0 && (
                <div className="mb-6">
                  <p className="mb-2 px-3 text-sm text-white/50">오늘</p>
                  <div className="space-y-1">
                    {todaySessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => openSession(session.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-white/5"
                      >
                        <MessageCircle className="size-5 shrink-0 text-white/80" />
                        <span className="truncate">{session.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {yesterdaySessions.length > 0 && (
                <div className="mb-6">
                  <p className="mb-2 px-3 text-sm text-white/50">어제</p>
                  <div className="space-y-1">
                    {yesterdaySessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => openSession(session.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-white/5"
                      >
                        <MessageCircle className="size-5 shrink-0 text-white/80" />
                        <span className="truncate">{session.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {last7DaysSessions.length > 0 && (
                <div>
                  <p className="mb-2 px-3 text-sm text-white/50">지난 7일</p>
                  <div className="space-y-1">
                    {last7DaysSessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => openSession(session.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-white/5"
                      >
                        <MessageCircle className="size-5 shrink-0 text-white/80" />
                        <span className="truncate">{session.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}