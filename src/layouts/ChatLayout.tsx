import { Outlet } from "react-router-dom";
import { Search, FileText, MessageSquarePlus, Settings2, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChatStore } from "@/stores/chatStore";
import { useUiStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";

export function ChatLayout() {
  const { sessions, activeSessionId, selectSession, startNewChat } = useChatStore();
  const { panel, setPanel, documentSearch, setDocumentSearch } = useUiStore();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden w-[300px] flex-col border-r border-border bg-card md:flex">
        <div className="p-4">
          <Button
            className="w-full justify-start gap-2 rounded-xl"
            variant="secondary"
            onClick={startNewChat}
          >
            <MessageSquarePlus className="size-4" /> 새 대화
          </Button>
        </div>

        <div className="px-4 pb-3">
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

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mutedForeground" />
            <Input
              value={documentSearch}
              onChange={(e) => setDocumentSearch(e.target.value)}
              placeholder="문서 검색"
              className="h-9 rounded-lg pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-4">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  setPanel("chat");
                  void selectSession(session.id);
                }}
                className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                  activeSessionId === session.id
                    ? "bg-accent text-accentForeground"
                    : "text-mutedForeground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <p className="truncate font-medium">{session.title}</p>
                <p className="mt-1 text-xs opacity-80">{session.updatedAt}</p>
              </button>
            ))}
          </div>
        </ScrollArea>

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
      </aside>

      <main className="flex min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}