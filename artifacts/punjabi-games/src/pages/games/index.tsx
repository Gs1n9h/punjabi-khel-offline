import { Link } from "wouter";
import { useState, useEffect } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { useGetCurrentPlayer, useGetGameProgress, useGetMyStats, useGetLeaderboard, useNewEventPlayer, useResetCurrentPlayer, useStartEventPlayer } from "@/lib/offline-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, RotateCcw, Trophy, UserPlus, Crown, Medal } from "lucide-react";
import { motion } from "framer-motion";

const games = [
  {
    id: "spinner",
    title: "ਚਰਖਾ",
    subtitle: "ਚਰਖਾ ਘੁੰਮਾਓ ਅਤੇ ਅੱਖਰ ਜੁੱਤੋ!",
    emoji: "🎡",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    href: "/games/spinner",
    progressKey: "spin"
  },
  {
    id: "memory",
    title: "ਯਾਦ ਖੇਡ",
    subtitle: "ਨੰਬਰ ਯਾਦ ਕਰੋ!",
    emoji: "🧠",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    href: "/games/memory",
    progressKey: "memory"
  },
  {
    id: "tongue-twister",
    title: "ਆਖੀਂ ਪਰ ਅੜੀਂ ਨਾਂ",
    subtitle: "ਆਓ ਆਪਣੀ ਜੀਭ ਦਾ ਜ਼ੋਰ ਅਜਮਾਓ!",
    emoji: "🎙️",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    href: "/games/tongue-twister",
    progressKey: "tongue-twister"
  },
  {
    id: "picture",
    title: "ਤਸਵੀਰ ਪਛਾਣ",
    subtitle: "Tasveer Pachaan · ਤਸਵੀਰ ਵੇਖੋ ਤੇ ਸਹੀ ਨਾਮ ਚੁਣੋ!",
    emoji: "🖼️",
    color: "bg-green-50 text-green-700 border-green-200",
    href: "/games/picture",
    progressKey: "picture",
    isNew: true
  }
];

function GameCard({ game, index }: { game: typeof games[number]; index: number }) {
  const { data: progress } = useGetGameProgress(game.progressKey as any);
  const disabled = progress?.isComplete;
  const card = (
    <div className={`bg-white/95 border-4 border-white rounded-[28px] p-4 flex items-center gap-4 shadow-lg shadow-[#1a237e]/10 transition-all ${disabled ? "opacity-50 grayscale" : "hover:border-primary hover:shadow-xl hover:-translate-y-1 active:translate-y-0 cursor-pointer"}`}>
      <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center border-4 text-4xl shadow-inner ${game.color}`}>
        {game.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-2xl font-black text-foreground leading-tight">{game.title}</h3>
          {game.isNew && <span className="rounded-full bg-green-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wide">New</span>}
        </div>
        <p className="text-sm font-bold text-muted-foreground mt-1">{game.subtitle}</p>
        <p className="text-xs font-black text-primary mt-2">ਮੌਕੇ ਵਰਤੇ: {progress?.used ?? 0}/{progress?.limit ?? 0}</p>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
      {disabled ? card : <Link href={game.href}>{card}</Link>}
    </motion.div>
  );
}

export default function GamesHub() {
  const { data: stats, isLoading } = useGetMyStats();
  const { data: player } = useGetCurrentPlayer();
  const startPlayer = useStartEventPlayer();
  const resetPlayer = useResetCurrentPlayer();
  const newPlayer = useNewEventPlayer();
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");

  // Check progress across all games
  const { data: spinProgress } = useGetGameProgress("spin");
  const { data: memoryProgress } = useGetGameProgress("memory");
  const { data: tongueProgress } = useGetGameProgress("tongue-twister");
  const { data: pictureProgress } = useGetGameProgress("picture");
  const allGamesComplete = Boolean(
    spinProgress?.isComplete &&
    memoryProgress?.isComplete &&
    tongueProgress?.isComplete &&
    pictureProgress?.isComplete
  );

  const { data: leaderboard } = useGetLeaderboard();
  const currentPlayerEntry = player
    ? leaderboard?.find((entry: any) => entry.userId === player.id)
    : null;
  const [showAllDonePopup, setShowAllDonePopup] = useState(false);

  // Auto-show popup when all games become complete; allow user to close
  useEffect(() => {
    if (allGamesComplete) setShowAllDonePopup(true);
  }, [allGamesComplete]);

  const handleStart = () => {
    if (!name.trim() || !place.trim()) return;
    startPlayer.mutate({ data: { name, place } });
  };

  if (!player) {
    return (
      <MobileContainer className="bg-[radial-gradient(circle_at_top,#FFF8E1_0%,#FAF6EE_42%,#F0EBE0_100%)]">
        <div className="flex-1 flex flex-col px-6 py-6">
          <div className="flex justify-end">
            <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.jpeg`} alt="ਗੁਰਮੁਖੀ ਵੇਹੜਾ" className="w-16 h-16 rounded-full border-2 border-primary shadow-md bg-white z-20" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-xl bg-white/95 border-4 border-white rounded-[32px] p-6 sm:p-8 shadow-xl space-y-5">
              <div className="text-center">
                <div className="text-6xl mb-3">🎪</div>
                <h1 className="text-4xl font-black text-primary leading-tight">ਨਵਾਂ ਸੈਸ਼ਨ</h1>
                <p className="text-muted-foreground font-bold mt-2">ਐਥਲੀਟ/ਖਿਡਾਰੀ ਦਾ ਨਾਮ ਤੇ ਸ਼ਹਿਰ ਲਿਖੋ।</p>
              </div>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ਤੁਹਾਡਾ ਨਾਮ" className="w-full h-16 rounded-2xl border-2 border-[#d4c9a8] bg-[#FAF6EE] px-5 text-xl font-bold outline-none focus:border-primary" />
              <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="ਤੁਸੀਂ ਕਿੱਥੋਂ ਹੋ?" className="w-full h-16 rounded-2xl border-2 border-[#d4c9a8] bg-[#FAF6EE] px-5 text-xl font-bold outline-none focus:border-primary" />
              <Button onClick={handleStart} disabled={!name.trim() || !place.trim()} className="w-full h-16 text-xl rounded-2xl bg-primary hover:bg-[#141b4d] text-white shadow-lg border-b-4 border-[#0f1540]">
                <UserPlus className="w-6 h-6 mr-2" /> ਸੈਸ਼ਨ ਸ਼ੁਰੂ ਕਰੋ
              </Button>
            </div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer withBottomNav className="bg-[radial-gradient(circle_at_top,#FFF8E1_0%,#FAF6EE_42%,#F0EBE0_100%)]">
      <PageHeader
        title="ਗੁਰਮੁਖੀ ਵੇਹੜਾ"
        subtitle={`${player.name} · ${player.place}`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => newPlayer.mutate({})} className="h-11 rounded-2xl bg-primary text-white px-4 text-sm font-black shadow-md border-b-4 border-[#0f1540] active:border-b-0">
              ਨਵਾਂ ਸੈਸ਼ਨ
            </button>
            <img
              src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.jpeg`}
              alt="ਗੁਰਮੁਖੀ ਵੇਹੜਾ"
              className="w-12 h-12 rounded-full border-2 border-primary shadow-sm bg-white relative z-20"
            />
          </div>
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
                <p className="text-primary-foreground/90 font-black mb-1 uppercase tracking-wide text-xs">ਇਸ ਖਿਡਾਰੀ ਦੇ ਅੰਕ</p>
                {isLoading ? (
                  <Skeleton className="h-10 w-24 bg-white/20" />
                ) : (
                  <h2 className="text-5xl font-black drop-shadow-sm">{stats?.totalPoints || 0}</h2>
                )}
              </div>
              <button
                onClick={() => { if (confirm("ਕੀ ਇਸ ਖਿਡਾਰੀ ਨੂੰ ਮੁੜ ਸ਼ੁਰੂ ਕਰਨਾ ਹੈ?")) resetPlayer.mutate({}); }}
                className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-2 text-xs font-bold transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                ਮੁੜ ਸੈਟ
              </button>
            </div>
            <button onClick={() => newPlayer.mutate({})} className="mt-5 bg-white text-primary hover:bg-white/90 rounded-2xl px-5 py-4 text-base font-black transition-all flex items-center gap-2 shadow-lg">
              <MapPin className="w-5 h-5" /> ਨਵਾਂ ਸੈਸ਼ਨ / New Session
            </button>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid gap-4">
          {games.map((game, i) => <GameCard key={game.id} game={game} index={i} />)}
        </div>
      </div>

      <BottomNav />

      {/* All games complete popup */}
      <Dialog open={showAllDonePopup} onOpenChange={setShowAllDonePopup}>
        <DialogContent className="max-w-sm rounded-[28px] border-4 border-[#e8e0d0] bg-gradient-to-b from-[#FAF6EE] to-[#E8E0D0] p-0 overflow-hidden">
          <div className="p-6 text-center space-y-5">
            <div className="text-6xl">🏆</div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-black text-primary">ਸਾਰੇ ਖੇਡ ਮੁਕੰਮਲ!</DialogTitle>
              <DialogDescription className="text-sm font-bold text-muted-foreground">
                ਤੁਸੀਂ ਸਾਰੇ ਖੇਡਾਂ ਦੇ ਮੌਕੇ ਵਰਤੇ ਹਨ।
              </DialogDescription>
            </DialogHeader>

            {currentPlayerEntry && (
              <div className="bg-white rounded-2xl border-2 border-[#d4c9a8] p-4 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {currentPlayerEntry.rank === 1 ? (
                    <Crown className="w-6 h-6 text-yellow-500" />
                  ) : currentPlayerEntry.rank && currentPlayerEntry.rank <= 3 ? (
                    <Medal className="w-6 h-6 text-amber-600" />
                  ) : (
                    <Trophy className="w-6 h-6 text-primary" />
                  )}
                  <span className="text-lg font-black text-primary">
                    #{currentPlayerEntry.rank}
                  </span>
                </div>
                <p className="font-bold text-sm text-foreground">{currentPlayerEntry.displayName || currentPlayerEntry.username}</p>
                <div className="mt-3 bg-primary/10 rounded-xl p-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase">ਕੁੱਲ ਅੰਕ</p>
                  <p className="text-4xl font-black text-primary">{currentPlayerEntry.totalPoints}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-bold">{currentPlayerEntry.gamesPlayed} ਖੇਡਾਂ ਖੇਡੀਆਂ</p>
              </div>
            )}

            {!currentPlayerEntry && stats && (
              <div className="bg-white rounded-2xl border-2 border-[#d4c9a8] p-4 shadow-sm">
                <div className="mt-3 bg-primary/10 rounded-xl p-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase">ਕੁੱਲ ਅੰਕ</p>
                  <p className="text-4xl font-black text-primary">{stats.totalPoints}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => newPlayer.mutate({})}
                className="w-full h-14 text-xl rounded-2xl bg-primary hover:bg-[#141b4d] text-white shadow-lg border-b-4 border-[#0f1540] active:border-b-0 active:translate-y-1 transition-all"
              >
                <UserPlus className="w-6 h-6 mr-2" /> ਨਵਾਂ ਸੈਸ਼ਨ ਸ਼ੁਰੂ ਕਰੋ
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAllDonePopup(false)}
                className="w-full h-12 rounded-2xl border-2 border-[#d4c9a8] text-lg font-bold"
              >
                ਬੰਦ ਕਰੋ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileContainer>
  );
}
