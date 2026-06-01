import { MobileContainer } from "@/components/layout/mobile-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageHeader } from "@/components/ui/page-header";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal } from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const { data: allTime, isLoading: isAllTimeLoading } = useGetLeaderboard({ query: { queryKey: ["leaderboard", "all"] } });

  return (
    <MobileContainer withBottomNav>
      <PageHeader title="Leaderboard" subtitle="Top players in Punjabi Khel" />

      <div className="p-4 flex-1 overflow-y-auto">
        {isAllTimeLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {allTime?.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${
                  index === 0 ? "bg-amber-50 border-amber-200" :
                  index === 1 ? "bg-slate-50 border-slate-200" :
                  index === 2 ? "bg-orange-50 border-orange-200" :
                  "bg-white border-gray-100"
                }`}
              >
                <div className="w-8 flex justify-center font-black text-lg">
                  {index === 0 ? <Trophy className="text-amber-500" /> :
                   index === 1 ? <Medal className="text-slate-400" /> :
                   index === 2 ? <Medal className="text-orange-400" /> :
                   <span className="text-gray-400">#{entry.rank}</span>}
                </div>
                
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarImage src={entry.avatarUrl || ""} />
                  <AvatarFallback className="font-bold">{entry.displayName?.charAt(0) || entry.username.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="font-bold text-base line-clamp-1">{entry.displayName || entry.username}</p>
                </div>

                <div className="text-right">
                  <p className="font-black text-primary text-lg">{entry.totalPoints}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">pts</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </MobileContainer>
  );
}
