import { Link } from "wouter";
import { MobileContainer } from "@/components/layout/mobile-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/layout/admin-nav";
import { useGetAdminDashboard } from "@/lib/offline-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Gamepad2, AlertCircle, Dices, Mic, BookOpen, Brain, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();

  const sections = [
    { href: "/admin/spinner", label: "ਚਰਖਾ ਸੈਟਿੰਗਾਂ", sub: "ਡਿਸਪਲੇਅ ਮੋਡ, ਆਈਟਮ, ਰੰਗ", icon: Dices, color: "bg-blue-50 border-blue-100 text-blue-600" },
    { href: "/admin/tongue-twisters", label: "ਬੋਲੀ (ਜ਼ੁਬਾਨ ਚੁਸਤੀਆਂ)", sub: "ਸ਼ਾਮਲ ਕਰੋ, ਸੋਧੋ, ਚਾਲੂ/ਬੰਦ", icon: Mic, color: "bg-orange-50 border-orange-100 text-orange-600" },
    { href: "/admin/submissions", label: "ਆਵਾਜ਼ ਪੰਛੀਤੀ", sub: "ਰਿਕਾਰਡਿੰਗ ਸੁਣੋ ਅਤੇ ਅੰਕ ਦਿਓ", icon: Mic, color: "bg-yellow-50 border-yellow-100 text-yellow-600" },
    { href: "/admin/users", label: "ਉਪਯੋਗਕਰਤਾ ਪ੍ਰਬੰਧ", sub: "ਉਪਯੋਗਕਰਤਾ ਵੇਖੋ, ਭੂਮਿਕਾ ਨਿਯੁਕਤ ਕਰੋ", icon: Users, color: "bg-purple-50 border-purple-100 text-purple-600" },
  ];

  return (
    <MobileContainer withBottomNav>
      <PageHeader title="ਪ੍ਰਬੰਧਕ" subtitle="ਡੈਸ਼ਬੋਰਡ ਸਾਰਾਂਸ਼" />
      <AdminNav />

      <div className="p-4 space-y-5">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border-2 border-orange-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              <span className="font-bold text-xs uppercase">ਉਪਯੋਗਕਰਤਾ</span>
            </div>
            {isLoading ? <Skeleton className="h-8 w-12" /> : (
              <div>
                <p className="text-3xl font-black">{dashboard?.totalUsers ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{dashboard?.activeUsers ?? 0} active</p>
              </div>
            )}
          </div>
          <div className="bg-white border-2 border-orange-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Gamepad2 className="w-4 h-4" />
              <span className="font-bold text-xs uppercase">ਖੇਡਾਂ</span>
            </div>
            {isLoading ? <Skeleton className="h-8 w-12" /> : (
              <p className="text-3xl font-black">{dashboard?.totalGamesPlayed ?? 0}</p>
            )}
          </div>
        </div>

        {/* Pending Reviews Alert */}
        {(isLoading || (dashboard?.pendingSubmissions ?? 0) > 0) && (
          <Link href="/admin/submissions">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-red-400 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-xl text-red-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-red-900 text-sm">ਬਕਾਇਆ ਪੰਛੀਤੀ</p>
                  <p className="text-xs text-red-700">ਆਵਾਜ਼ ਦਾਖਲੇ ਦੀ ਉਡੀਕ</p>
                </div>
              </div>
              {isLoading ? <Skeleton className="h-8 w-12" /> : (
                <p className="text-3xl font-black text-red-600">{dashboard?.pendingSubmissions}</p>
              )}
            </div>
          </Link>
        )}

        {/* Quick Nav Sections */}
        <div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">ਸਮੱਗਰੀ ਦਾ ਪ੍ਰਬੰਧ</p>
          <div className="space-y-2">
            {sections.map((s, i) => (
              <motion.div key={s.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={s.href}>
                  <div className="flex items-center gap-3 p-3.5 bg-white border-2 border-slate-100 rounded-2xl hover:border-primary shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top Players */}
        {!isLoading && dashboard?.topPlayers && dashboard.topPlayers.length > 0 && (
          <div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">ਸਿਖਰ ਖਿਡਾਰੀ</p>
            <div className="space-y-2">
              {dashboard.topPlayers.map((p, i) => (
                <div key={p.userId} className="flex items-center gap-3 p-3 bg-white border-2 border-slate-100 rounded-xl">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-600" : "bg-orange-200 text-orange-700"}`}>
                    {i + 1}
                  </div>
                  <p className="flex-1 font-bold text-sm">{p.displayName || p.username}</p>
                  <p className="font-black text-primary text-sm">{p.totalPoints} pts</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </MobileContainer>
  );
}
