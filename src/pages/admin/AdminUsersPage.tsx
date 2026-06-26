import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminTable, RoleBadge, SurfaceCard, UserStatusBadge } from "@/pages/admin/adminShared";
import { getAdminUsers, type AdminUserDto } from "@/lib/chatApi";
import { showToast } from "@/stores/notificationStore";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "dormant";
  userType: "USER" | "ADMIN";
  joinedAt: string;
};

function formatJoinedAt(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function toAdminUserRow(user: AdminUserDto): AdminUserRow {
  return {
    id: user.user_id,
    name: user.name,
    email: user.email,
    userType: user.user_type,
    joinedAt: formatJoinedAt(user.created_at),
    status: "active",
  };
}

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUserRow[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAdminUsers();
        setUsers(data.map(toAdminUserRow));
      } catch (error) {
        showToast({
          title: "사용자 목록 조회 실패",
          description: error instanceof Error ? error.message : "관리자 사용자 목록을 불러오지 못했습니다.",
          tone: "error",
        });
      }
    };

    void fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter(
      (entry) =>
        entry.name.toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query)
    );
  }, [search, users]);

  return (
    <div className="space-y-6">
      <SurfaceCard
        title="사용자 목록"
        description="관리자 권한으로 전체 사용자 정보를 조회합니다."
        action={
          <div className="relative w-full md:w-[300px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="사용자 검색"
              className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-11"
            />
          </div>
        }
      >
        <AdminTable headers={["이름", "이메일", "상태", "권한", "가입일"]}>
          {filteredUsers.map((entry) => (
            <tr key={entry.id}>
              <td className="px-5 py-4 font-medium text-slate-800">{entry.name}</td>
              <td className="px-5 py-4 text-slate-500">{entry.email}</td>
              <td className="px-5 py-4">
                <UserStatusBadge status={entry.status} />
              </td>
              <td className="px-5 py-4">
                <RoleBadge isAdmin={entry.userType === "ADMIN"} />
              </td>
              <td className="px-5 py-4 text-slate-500">{entry.joinedAt}</td>
            </tr>
          ))}
        </AdminTable>
      </SurfaceCard>
    </div>
  );
}