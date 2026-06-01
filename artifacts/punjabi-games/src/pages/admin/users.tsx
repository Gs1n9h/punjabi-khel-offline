import { useState } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/layout/admin-nav";
import { useListAdminUsers, useUpdateUserRole } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Search, ShieldCheck, User, Shield } from "lucide-react";

const ROLE_STYLES = {
  admin: "bg-red-100 text-red-700",
  moderator: "bg-blue-100 text-blue-700",
  user: "bg-slate-100 text-slate-600",
};

const ROLE_ICONS = {
  admin: ShieldCheck,
  moderator: Shield,
  user: User,
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useListAdminUsers({ params: {} });
  const updateRole = useUpdateUserRole();
  const { toast } = useToast();

  const filtered = users?.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.displayName ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleRoleChange = (id: number, currentRole: string, username: string) => {
    const roles = ["user", "moderator", "admin"];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length] as "user" | "moderator" | "admin";
    if (!confirm(`Change @${username} to "${nextRole}"?`)) return;
    updateRole.mutate({ id: String(id), data: { role: nextRole } }, {
      onSuccess: () => {
        toast({ title: `@${username} is now ${nextRole}` });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      },
      onError: () => toast({ title: "Error changing role", variant: "destructive" }),
    });
  };

  return (
    <MobileContainer>
      <PageHeader title="Admin" subtitle="User Management" />
      <AdminNav />

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-black text-lg">Users</h2>
          <span className="text-sm text-muted-foreground font-bold">{filtered.length} total</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-slate-100">
            <p className="text-muted-foreground font-bold">No users found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(u => {
              const RoleIcon = ROLE_ICONS[u.role as keyof typeof ROLE_ICONS] || User;
              return (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.username} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center font-black text-primary text-sm">
                      {(u.displayName || u.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{u.displayName || u.username}</p>
                    <p className="text-xs text-muted-foreground">@{u.username} · {u.totalPoints} pts</p>
                  </div>
                  <button
                    onClick={() => handleRoleChange(u.id, u.role, u.username)}
                    disabled={updateRole.isPending}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase border-2 transition-all hover:scale-105 ${ROLE_STYLES[u.role as keyof typeof ROLE_STYLES] || ROLE_STYLES.user}`}
                    title="Click to cycle role"
                  >
                    <RoleIcon className="w-3 h-3" />
                    {u.role}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
