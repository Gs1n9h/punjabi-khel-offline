import { MobileContainer } from "@/components/layout/mobile-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/layout/admin-nav";
import { useGetAdminDashboard } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Gamepad2, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();

  return (
    <MobileContainer withBottomNav>
      <PageHeader title="Admin" subtitle="Dashboard Overview" />
      <AdminNav />

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border-2 border-orange-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="w-5 h-5" />
              <span className="font-bold text-sm">Users</span>
            </div>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <div>
                <p className="text-3xl font-black">{dashboard?.totalUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">{dashboard?.activeUsers} active</p>
              </div>
            )}
          </div>
          <div className="bg-white border-2 border-orange-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Gamepad2 className="w-5 h-5" />
              <span className="font-bold text-sm">Games Played</span>
            </div>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-3xl font-black">{dashboard?.totalGamesPlayed}</p>
            )}
          </div>
          <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4 col-span-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-xl text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-red-900">Pending Reviews</p>
                <p className="text-xs text-red-700">Voice submissions waiting</p>
              </div>
            </div>
            {isLoading ? <Skeleton className="h-8 w-12" /> : (
              <p className="text-3xl font-black text-red-600">{dashboard?.pendingSubmissions}</p>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </MobileContainer>
  );
}
