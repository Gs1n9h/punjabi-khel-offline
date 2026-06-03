import { useState } from "react";
import { useLocation } from "wouter";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { useListTongueTwisters, useSubmitTongueTwisterRecording, useGetGameProgress } from "@/lib/offline-api";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function TongueTwisterGame() {
  const [, navigate] = useLocation();
  const { data: twisters, isLoading } = useListTongueTwisters();
  const submitRecording = useSubmitTongueTwisterRecording();
  const { data: progress } = useGetGameProgress("tongue-twister");
  const { toast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showScoreEntry, setShowScoreEntry] = useState(false);
  const [adminPoints, setAdminPoints] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [gameSaved, setGameSaved] = useState(false);

  const activeTwisters = twisters?.filter(t => t.isActive) ?? [];
  const activeTwister = activeTwisters[currentIndex];
  const isLast = currentIndex >= activeTwisters.length - 1;

  const handleNext = () => {
    if (isLast) {
      setShowScoreEntry(true);
    } else {
      setCurrentIndex((prev: number) => prev + 1);
    }
  };

  const handleAdminScore = async (points: number) => {
    setAdminPoints(points);
    setIsUploading(true);
    try {
      await submitRecording.mutateAsync({
        id: activeTwisters[0]?.id ?? 0,
        data: { audioUrl: "", durationSeconds: 0, pointsEarned: points }
      });
      setGameSaved(true);
      toast({ title: `${points} ਅੰਕ ਸੇਵ ਹੋ ਗਏ!` });
      setTimeout(() => navigate("/games"), 2500);
    } catch (err) {
      toast({ title: "ਸੇਵ ਨਹੀਂ ਹੋ ਸਕਿਆ", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <MobileContainer>
        <PageHeader title="ਬੋਲੀ" showBack />
        <div className="p-4 space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </MobileContainer>
    );
  }

  if (progress?.isComplete) {
    return (
      <MobileContainer className="bg-gradient-to-b from-[#FFF8F0] to-orange-50">
        <PageHeader title="ਬੋਲੀ" subtitle="ਜ਼ੁਬਾਨ ਚੁਸਤੀਆਂ" showBack />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-7xl mb-4">🎙️</div>
          <h2 className="text-3xl font-black text-primary mb-2">ਮੌਕੇ ਪੂਰੇ ਹੋ ਗਏ!</h2>
          <p className="text-muted-foreground font-bold">ਇਸ ਖਿਡਾਰੀ ਲਈ ਬੋਲੀ ਦੇ ਸਾਰੇ ਮੌਕੇ ਵਰਤੇ ਜਾ ਚੁੱਕੇ ਹਨ।</p>
        </div>
      </MobileContainer>
    );
  }

  if (!activeTwister) {
    return (
      <MobileContainer className="bg-gradient-to-b from-[#FFF8F0] to-orange-50">
        <PageHeader title="ਬੋਲੀ" subtitle={`ਬਾਕੀ ਮੌਕੇ: ${progress?.remaining ?? 0}/${progress?.limit ?? 0}`} showBack />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-7xl mb-4">🎙️</div>
          <h2 className="text-3xl font-black text-primary mb-2">ਸਭ ਕੁਝ ਹੋ ਗਿਆ!</h2>
          <p className="text-muted-foreground font-bold">ਕੋਈ ਜ਼ੁਬਾਨ ਚੁਸਤੀ ਨਹੀਂ ਮਿਲੀ।</p>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer className="bg-gradient-to-b from-[#FFF8F0] to-orange-50">
      <PageHeader
        title="ਬੋਲੀ"
        subtitle={
          showScoreEntry ? "ਅੰਕ ਦਰਜ ਕਰੋ" :
          gameSaved ? "ਸੇਵ ਹੋ ਗਏ!" :
          `${currentIndex + 1}/${activeTwisters.length} — ਬਾਕੀ ਮੌਕੇ: ${progress?.remaining ?? 0}/${progress?.limit ?? 0}`
        }
        showBack
      />

      <div className="flex-1 flex flex-col p-6">
        {!showScoreEntry && !gameSaved && (
          <>
            <motion.div
              key={activeTwister.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 shadow-xl border-4 border-orange-100 text-center flex-1 flex flex-col justify-center relative"
            >
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-orange-100 text-primary font-bold rounded-full text-xs uppercase">
                  {activeTwister.difficulty}
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-[#2A1806] leading-tight mb-6">
                {activeTwister.text}
              </h2>
              {activeTwister.transliteration && (
                <p className="text-xl font-medium text-muted-foreground italic mb-2">
                  "{activeTwister.transliteration}"
                </p>
              )}
              {activeTwister.translation && (
                <p className="text-sm font-bold text-slate-400">
                  {activeTwister.translation}
                </p>
              )}
            </motion.div>

            <div className="mt-8">
              <Button
                onClick={handleNext}
                className="w-full h-16 text-xl rounded-2xl bg-primary hover:bg-[#D4600E] text-white shadow-lg border-b-4 border-[#0f1540] active:border-b-0 active:translate-y-1 transition-all"
              >
                {isLast ? "ਅੰਕ ਦਰਜ ਕਰੋ →" : "ਅਗਲਾ →"}
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </div>
          </>
        )}

        {/* Admin score entry after all twisters */}
        {showScoreEntry && !gameSaved && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm bg-white rounded-2xl border-4 border-[#e8e0d0] shadow-xl p-6 text-center">
              <div className="text-5xl mb-3">⭐</div>
              <h3 className="text-2xl font-black text-primary mb-1">ਅੰਕ ਦਰਜ ਕਰੋ</h3>
              <p className="text-sm text-muted-foreground font-bold mb-5">Admin: ਖਿਡਾਰੀ ਦੇ ਅੰਕ ਚੁਣੋ</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[10, 20, 30, 40, 50].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => handleAdminScore(pts)}
                    disabled={isUploading}
                    className="h-14 bg-primary/10 border-2 border-primary/30 rounded-xl text-lg font-black text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                  >
                    {pts}
                  </button>
                ))}
              </div>
              {isUploading && <p className="text-sm text-muted-foreground">ਸੇਵ ਹੋ ਰਿਹਾ ਹੈ…</p>}
            </div>
          </div>
        )}

        {/* Saved state */}
        {gameSaved && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm bg-green-50 rounded-2xl border-4 border-green-200 shadow-xl p-6 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-2xl font-black text-green-700 mb-1">ਸੇਵ ਹੋ ਗਏ!</h3>
              <p className="text-2xl font-black text-primary mb-1">{adminPoints} ਅੰਕ</p>
              <p className="text-sm text-muted-foreground">ਖੇਡਾਂ ਵੱਲ ਵਾਪਸ ਜਾ ਰਹੇ ਹਾਂ…</p>
              <Button onClick={() => navigate("/games")} variant="outline" className="mt-4 w-full h-12 rounded-xl border-2 border-[#d4c9a8]">
                ਖੇਡਾਂ ਵੱਲ
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
