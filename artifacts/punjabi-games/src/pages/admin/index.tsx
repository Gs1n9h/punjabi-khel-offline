import { Link } from "wouter";
import { useState } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/layout/admin-nav";
import { useGetAdminDashboard, useResetCurrentPlayer, useResetScores } from "@/lib/offline-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Gamepad2, AlertCircle, Dices, Mic, Shield, ChevronRight, Trash2, RotateCcw, X, Delete } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const ADMIN_PASSCODE = "1331";

type ClearAction = "all" | "session" | null;

function PasscodeDialog({ action, onConfirm, onCancel }: { action: ClearAction; onConfirm: () => void; onCancel: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleKey = (digit: string) => {
    if (code.length >= 4) return;
    const next = code + digit;
    setCode(next);
    setError(false);
    if (next.length === 4) {
      if (next === ADMIN_PASSCODE) {
        setTimeout(() => {
          onConfirm();
          setCode("");
        }, 200);
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => { setCode(""); setShake(false); }, 700);
      }
    }
  };

  const handleBack = () => {
    setCode(prev => prev.slice(0, -1));
    setError(false);
  };

  const label = action === "all" ? "ਸਾਰਾ ਡੇਟਾ ਮਿਟਾਓ" : "ਮੌਜੂਦਾ ਸੈਸ਼ਨ ਰੀਸੈੱਟ";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0], scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
        transition={{ duration: shake ? 0.5 : 0.2 }}
        className="w-full max-w-xs bg-white rounded-3xl shadow-2xl border-4 border-red-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-red-50 px-5 py-4 flex items-center justify-between border-b-2 border-red-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span className="font-black text-red-700 text-sm">ਐਡਮਿਨ ਤਸਦੀਕ</span>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">ਪਾਸਕੋਡ ਦਰਜ ਕਰੋ</p>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-3">
            {[0,1,2,3].map(i => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  code.length > i
                    ? error ? "bg-red-500 border-red-500" : "bg-primary border-primary"
                    : "border-[#d4c9a8]"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-xs text-red-600 font-bold">❌ ਗਲਤ ਪਾਸਕੋਡ</p>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button
                key={n}
                onPointerDown={() => handleKey(String(n))}
                className="h-14 bg-[#f5f0e0] border-2 border-[#d4c9a8] rounded-2xl text-xl font-black text-primary active:bg-primary active:text-white transition-all touch-manipulation select-none"
              >
                {n}
              </button>
            ))}
            <div />
            <button
              onPointerDown={() => handleKey("0")}
              className="h-14 bg-[#f5f0e0] border-2 border-[#d4c9a8] rounded-2xl text-xl font-black text-primary active:bg-primary active:text-white transition-all touch-manipulation select-none"
            >
              0
            </button>
            <button
              onPointerDown={handleBack}
              className="h-14 bg-white border-2 border-[#d4c9a8] rounded-2xl text-base font-bold text-primary active:bg-[#ebe5d0] transition-all flex items-center justify-center touch-manipulation select-none"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onCancel}
            className="w-full h-11 rounded-xl border-2 border-[#d4c9a8] text-sm font-bold text-muted-foreground hover:border-primary"
          >
            ਰੱਦ ਕਰੋ
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();
  const resetScores = useResetScores();
  const resetPlayer = useResetCurrentPlayer();
  const [pendingAction, setPendingAction] = useState<ClearAction>(null);

  const handleConfirm = () => {
    if (pendingAction === "all") {
      // Clear all localStorage data
      const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith("pk_") || k === "yaad-best-time");
      keysToRemove.forEach(k => localStorage.removeItem(k));
      resetScores.mutate({});
      window.dispatchEvent(new Event("pk-local-change"));
    } else if (pendingAction === "session") {
      resetPlayer.mutate({});
    }
    setPendingAction(null);
    // Brief visual feedback
    setTimeout(() => window.location.reload(), 300);
  };

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

        {/* Danger Zone */}
        <div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">⚠️ ਖ਼ਤਰਨਾਕ ਜ਼ੋਨ</p>
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 space-y-3">
            <p className="text-xs text-red-700 font-bold">ਹੇਠਾਂ ਦਿੱਤੇ ਬਟਨ ਅਟੱਲ ਕਾਰਵਾਈਆਂ ਕਰਦੇ ਹਨ। ਐਡਮਿਨ ਪਾਸਕੋਡ ਲੋੜੀਂਦਾ ਹੈ।</p>

            {/* Reset current session */}
            <button
              onClick={() => setPendingAction("session")}
              className="w-full flex items-center gap-3 p-3 bg-white border-2 border-orange-200 rounded-xl hover:border-orange-400 transition-all text-left"
            >
              <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-foreground">ਮੌਜੂਦਾ ਸੈਸ਼ਨ ਰੀਸੈੱਟ</p>
                <p className="text-xs text-muted-foreground">ਇੱਕ ਖਿਡਾਰੀ ਦੇ ਸਕੋਰ ਮਿਟਾਓ</p>
              </div>
            </button>

            {/* Clear all data */}
            <button
              onClick={() => setPendingAction("all")}
              className="w-full flex items-center gap-3 p-3 bg-white border-2 border-red-200 rounded-xl hover:border-red-500 transition-all text-left"
            >
              <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-red-700">ਸਾਰਾ ਡੇਟਾ ਮਿਟਾਓ (Cache Clear)</p>
                <p className="text-xs text-muted-foreground">ਸਾਰੇ ਖਿਡਾਰੀ, ਸਕੋਰ, ਸੈਟਿੰਗਾਂ ਮਿਟਾਓ</p>
              </div>
            </button>
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

      {/* Passcode dialog */}
      <AnimatePresence>
        {pendingAction && (
          <PasscodeDialog
            action={pendingAction}
            onConfirm={handleConfirm}
            onCancel={() => setPendingAction(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </MobileContainer>
  );
}
