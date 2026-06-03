import { Link } from "wouter";
import { MobileContainer } from "@/components/layout/mobile-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageHeader } from "@/components/ui/page-header";
import { useGetMyStats, useResetScores } from "@/lib/offline-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Dices, Mic, BrainCircuit, Brain, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const games = [
  {
    id: "spinner",
    title: "ਚਰਖਾ",
    subtitle: "ਚਰਖਾ ਘੁੰਮਾਓ ਅਤੇ ਅੱਖਰ ਜੁੱਤੋ!",
    emoji: "🎡",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    href: "/games/spinner"
  },
  {
    id: "memory",
    title: "ਯਾਦ ਖੇਡ",
    subtitle: "ਨੰਬਰ ਯਾਦ ਕਰੋ!",
    emoji: "🧠",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    href: "/games/memory"
  },
  {
    id: "tongue-twister",
    title: "ਬੋਲੀ",
    subtitle: "ਜ਼ੁਬਾਨ ਚੁਸਤੀਆਂ ਪੜ੍ਹੋ!",
    emoji: "🎙️",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    href: "/games/tongue-twister"
  }
];

export default function GamesHub() {
  const { data: stats, isLoading } = useGetMyStats();
  const resetScores = useResetScores();

  return (
    <MobileContainer withBottomNav className="bg-[radial-gradient(circle_at_top,#FFF8E1_0%,#FAF6EE_42%,#F0EBE0_100%)]">
      <PageHeader
        title="ਗੁਰਮੁਖੀ ਵੇਹੜਾ"
        subtitle="ਇੱਕ ਖੇਡ ਚੁਣੋ ਅਤੇ ਖੇਡਣਾ ਸ਼ੁਰੂ ਕਰੋ!"
        action={
          <img
            src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.png`}
            alt="ਗੁਰਮੁਖੀ ਵੇਹੜਾ"
            className="w-10 h-10 rounded-full border-2 border-primary shadow-sm"
          />
        }
      />
      
      <div className="p-4 space-y-6">
        {/* Stats Card */}
        <div className="bg-gradient-to-br from-primary via-secondary to-primary/80 text-primary-foreground rounded-[32px] p-6 shadow-xl shadow-[#1a237e]/20 relative overflow-hidden border-4 border-white">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/20" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-yellow-300/20" />
          <div className="absolute top-0 right-0 p-4 opacity-25">
            <Trophy className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/90 font-black mb-1 uppercase tracking-wide text-xs">ਸਿਖਰ ਅੰਕ</p>
                {isLoading ? (
                  <Skeleton className="h-10 w-24 bg-white/20" />
                ) : (
                  <h2 className="text-5xl font-black drop-shadow-sm">{stats?.topScore || 0}</h2>
                )}
              </div>
              <button
                onClick={() => { if (confirm("ਕੀ ਤੁਸੀਂ ਸਾਰੇ ਅੰਕ ਮਿਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ?")) resetScores.mutate({}); }}
                className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-2 text-xs font-bold transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                ਮੁੜ ਸੈਟ
              </button>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid gap-4">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={game.href}>
                <div className="bg-white/95 border-4 border-white hover:border-primary rounded-[28px] p-4 flex items-center gap-4 shadow-lg shadow-[#1a237e]/10 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer">
                  <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center border-4 text-4xl shadow-inner ${game.color}`}>
                    {game.emoji}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground leading-tight">{game.title}</h3>
                    <p className="text-sm font-bold text-muted-foreground mt-1">{game.subtitle}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </MobileContainer>
  );
}
