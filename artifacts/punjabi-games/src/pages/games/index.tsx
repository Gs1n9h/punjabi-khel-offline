import { Link } from "wouter";
import { MobileContainer } from "@/components/layout/mobile-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageHeader } from "@/components/ui/page-header";
import { useGetMyStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Dices, Mic, BrainCircuit, Brain } from "lucide-react";
import { motion } from "framer-motion";

const games = [
  {
    id: "spinner",
    title: "Charkha",
    subtitle: "Spin the wheel for points!",
    emoji: "🎡",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    href: "/games/spinner"
  },
  {
    id: "tongue-twister",
    title: "Boli",
    subtitle: "Read the tongue twister!",
    emoji: "🎙️",
    color: "bg-orange-50 text-orange-600 border-orange-200",
    href: "/games/tongue-twister"
  },
  {
    id: "knowledge-test",
    title: "Gyan",
    subtitle: "Test your Punjabi knowledge!",
    emoji: "📚",
    color: "bg-green-50 text-green-600 border-green-200",
    href: "/games/knowledge-test"
  },
  {
    id: "memory",
    title: "Yaad Khel",
    subtitle: "Remember the numbers!",
    emoji: "🧠",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    href: "/games/memory"
  }
];

export default function GamesHub() {
  const { data: stats, isLoading } = useGetMyStats();

  return (
    <MobileContainer withBottomNav>
      <PageHeader title="Games Hub" subtitle="Pick a game to play!" />
      
      <div className="p-4 space-y-6">
        {/* Stats Card */}
        <div className="bg-primary text-primary-foreground rounded-[24px] p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Trophy className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <p className="text-primary-foreground/80 font-bold mb-1">Your Score</p>
            {isLoading ? (
              <Skeleton className="h-10 w-24 bg-white/20" />
            ) : (
              <h2 className="text-4xl font-black">{stats?.totalPoints || 0} pts</h2>
            )}
            <div className="mt-4 flex gap-4">
              <div>
                <p className="text-xs font-bold opacity-80 uppercase">RANK</p>
                <p className="text-lg font-bold">#{stats?.rank || "--"}</p>
              </div>
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
                <div className="bg-white border-2 border-orange-100 hover:border-primary rounded-[24px] p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 text-3xl ${game.color}`}>
                    {game.emoji}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">{game.title}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{game.subtitle}</p>
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
