import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetGameProgress, useGetMyStats, useListPictureQuestions, useSubmitPictureAnswer } from "@/lib/offline-api";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function PictureGame() {
  const { data: questions, isLoading } = useListPictureQuestions();
  const { data: progress } = useGetGameProgress("picture");
  const { data: stats } = useGetMyStats();
  const submitAnswer = useSubmitPictureAnswer();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: boolean; pointsEarned: number; correctAnswer: string } | null>(null);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);

  const activeQuestions = questions ?? [];
  const currentQuestion = useMemo(() => activeQuestions[index % Math.max(1, activeQuestions.length)], [activeQuestions, index]);

  // Auto-advance after showing result for 1.5s
  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => {
      const limit = progress?.limit ?? 1;
      if (submittedCount >= limit || index >= activeQuestions.length - 1) {
        setShowGameOver(true);
      } else {
        setSelected(null);
        setResult(null);
        setIndex((prev: number) => prev + 1);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [result, submittedCount, index, activeQuestions.length, progress?.limit]);

  const handleSelect = (option: string) => {
    if (!currentQuestion || selected || showGameOver) return;
    setSelected(option);
    submitAnswer.mutate({ data: { questionId: currentQuestion.id, selectedAnswer: option } }, {
      onSuccess: (data) => {
        setResult(data);
        setSubmittedCount((c: number) => c + 1);
        if (data.correct) {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.58 }, colors: ["#1a237e", "#ffd700", "#4CAF50"] });
        }
      }
    });
  };

  if (isLoading) {
    return (
      <MobileContainer>
        <PageHeader title="ਤਸਵੀਰ ਪਛਾਣ" showBack backHref="/games" />
        <div className="flex-1 p-4 grid gap-4">
          <Skeleton className="h-72 rounded-[32px]" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </MobileContainer>
    );
  }

  if (showGameOver || progress?.isComplete) {
    return (
      <MobileContainer className="bg-gradient-to-b from-[#FAF6EE] to-[#E8E0D0]">
        <PageHeader title="ਤਸਵੀਰ ਪਛਾਣ" showBack backHref="/games" />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="w-full max-w-xl bg-white rounded-[32px] border-4 border-[#e8e0d0] shadow-xl p-8 space-y-5">
            <div className="text-7xl">🖼️</div>
            <h2 className="text-3xl font-black text-primary">ਮੌਕੇ ਪੂਰੇ ਹੋ ਗਏ!</h2>
            <div className="bg-primary/10 rounded-2xl p-4">
              <p className="text-sm font-bold text-muted-foreground">ਤੁਹਾਡੇ ਕੁੱਲ ਅੰਕ</p>
              <p className="text-5xl font-black text-primary">{stats?.totalPoints || 0}</p>
            </div>
            <Link href="/games">
              <Button className="w-full h-14 rounded-2xl text-lg font-bold">ਖੇਡਾਂ ਵੱਲ ਵਾਪਸ</Button>
            </Link>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer className="bg-[radial-gradient(circle_at_top,#ECFDF5_0%,#FAF6EE_48%,#E8E0D0_100%)]">
      <PageHeader title="ਤਸਵੀਰ ਪਛਾਣ" subtitle={`ਬਾਕੀ ਮੌਕੇ: ${progress?.remaining ?? 0}/${progress?.limit ?? 0}`} showBack backHref="/games" />
      <div className="flex-1 grid content-stretch gap-4 p-4 sm:p-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <motion.div key={currentQuestion.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/95 border-4 border-white rounded-[36px] shadow-xl p-4 sm:p-6 flex flex-col items-center justify-center min-h-[300px] md:min-h-[520px]">
          <div className="w-full flex-1 rounded-[28px] bg-gradient-to-br from-green-50 to-yellow-50 border-4 border-green-100 flex items-center justify-center overflow-hidden">
            {currentQuestion.imageUrl ? (
              <img src={currentQuestion.imageUrl} alt="ਤਸਵੀਰ" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[9rem] sm:text-[12rem] leading-none drop-shadow-sm">{currentQuestion.imageEmoji}</span>
            )}
          </div>
          <p className="mt-4 text-center text-xl sm:text-2xl font-black text-primary">ਇਹ ਕੀ ਹੈ?</p>
        </motion.div>

        <div className="flex flex-col justify-center gap-3 sm:gap-4">
          {currentQuestion.options.map((option: string, optionIndex: number) => {
            const isSelected = selected === option;
            const isCorrect = result && option === result.correctAnswer;
            const isWrong = result && isSelected && !result.correct;
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={Boolean(selected)}
                className={`min-h-16 sm:min-h-20 rounded-3xl border-4 px-5 text-left shadow-lg active:scale-[0.98] transition-all flex items-center gap-4 ${
                  isCorrect ? "bg-green-100 border-green-500 text-green-800" :
                  isWrong ? "bg-red-100 border-red-400 text-red-700" :
                  "bg-white border-white hover:border-primary text-foreground"
                }`}
              >
                <span className="w-11 h-11 rounded-2xl bg-[#f5f0e0] text-primary flex items-center justify-center font-black text-lg shrink-0">{String.fromCharCode(65 + optionIndex)}</span>
                <span className="text-2xl sm:text-3xl font-black leading-tight">{option}</span>
              </button>
            );
          })}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className={`rounded-[28px] border-4 p-5 text-center shadow-xl ${result.correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <div className="text-6xl mb-2">{result.correct ? "🎉" : "😬"}</div>
                <h2 className={`text-3xl font-black ${result.correct ? "text-green-700" : "text-red-600"}`}>{result.correct ? "ਸਹੀ!" : "ਓਹੋ!"}</h2>
                <p className="font-bold text-muted-foreground mt-1">ਸਹੀ ਜਵਾਬ: <span className="text-foreground text-xl font-black">{result.correctAnswer}</span></p>
                <p className="font-black text-primary mt-2">+{result.pointsEarned} ਅੰਕ</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MobileContainer>
  );
}
