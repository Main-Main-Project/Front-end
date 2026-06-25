import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminTable, mockAdminUsers, RoleBadge, SurfaceCard, UserStatusBadge } from "@/pages/admin/adminShared";

export function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return mockAdminUsers;
    return mockAdminUsers.filter((entry) => entry.name.toLowerCase().includes(query) || entry.email.toLowerCase().includes(query));
  }, [search]);

  return (
    <div className="space-y-6">

      <SurfaceCard
        title="사용자 목록"
        description="테이블 구조를 유지한 채, 이후 API 액션을 쉽게 붙일 수 있게 구성했습니다."
        action={
          <div className="relative w-full md:w-[300px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="사용자 검색" className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-11" />
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
