import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetGameProgress, useGetMyStats, useListPictureQuestions, useSubmitPictureSession, useForfeitPictureGame } from "@/lib/offline-api";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { SkipForward } from "lucide-react";
import { playCorrect, playWrong } from "@/lib/sounds";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


export default function PictureGame() {
  const [, navigate] = useLocation();
  const { data: questions, isLoading } = useListPictureQuestions();
  const { data: progress } = useGetGameProgress("picture");
  const { data: stats } = useGetMyStats();
  const submitSession = useSubmitPictureSession();
  const forfeitGame = useForfeitPictureGame();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: boolean; pointsEarned: number; correctAnswer: string } | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showGameOver, setShowGameOver] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [skippedIds, setSkippedIds] = useState<Set<number>>(new Set());
  const [totalScore, setTotalScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  // Stable shuffle: only reshuffle when questions list changes length (initial load)
  const shuffledQuestionsRef = useRef<typeof questions>(null);
  const activeQuestions = useMemo(() => {
    if (!questions) return [];
    if (shuffledQuestionsRef.current && shuffledQuestionsRef.current.length === questions.length) {
      return shuffledQuestionsRef.current;
    }
    const arr = shuffle(questions);
    shuffledQuestionsRef.current = arr;
    return arr;
  }, [questions]);
  const currentQuestion = useMemo(() => activeQuestions[index % Math.max(1, activeQuestions.length)], [activeQuestions, index]);

  // Shuffle options per question (stable while on same question)
  const shuffledOptions = useMemo(() => {
    if (!currentQuestion) return [];
    return shuffle(currentQuestion.options);
  }, [currentQuestion?.id]);

  // Submit session when game over triggers
  useEffect(() => {
    if (showGameOver) {
      submitSession.mutate({ data: { correct: result?.correct ?? false, pointsEarned: totalScore, questionsAnswered } });
    }
  }, [showGameOver]);

  // Auto-advance ONLY on correct answers
  useEffect(() => {
    if (!result || !result.correct) return;
    const timer = setTimeout(() => {
      if (index >= activeQuestions.length - 1) {
        setShowGameOver(true);
      } else {
        setSelected(null);
        setResult(null);
        setIndex((prev: number) => prev + 1);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [result, index, activeQuestions.length]);

  const handleSelect = useCallback((option: string) => {
    if (!currentQuestion || selected || showGameOver || attemptsLeft <= 0) return;
    setSelected(option);
    const correct = currentQuestion.answer === option;
    if (correct) {
      setQuestionsAnswered((prev: number) => prev + 1);
      setTotalScore((prev: number) => prev + 20);
      setResult({ correct: true, pointsEarned: 20, correctAnswer: currentQuestion.answer });
      playCorrect();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.58 }, colors: ["#1a237e", "#ffd700", "#4CAF50"] });
    } else {
      // Wrong: consume attempt, shake+buzz, stay on same question
      setAttemptsLeft((prev: number) => {
        const next = prev - 1;
        if (next <= 0) {
          setTimeout(() => setShowGameOver(true), 800);
        }
        return next;
      });
      playWrong();
      setShakeKey((k: number) => k + 1);
      setResult({ correct: false, pointsEarned: 0, correctAnswer: currentQuestion.answer });
      // Clear selection after short delay so they can retry
      setTimeout(() => {
        setSelected(null);
        setResult(null);
      }, 800);
    }
  }, [currentQuestion, selected, showGameOver, attemptsLeft]);

  const handleSkip = useCallback(() => {
    if (!currentQuestion || selected || showGameOver) return;
    setSkippedIds((prev: Set<number>) => new Set(prev).add(currentQuestion.id));
    if (index >= activeQuestions.length - 1) {
      setShowGameOver(true);
    } else {
      setSelected(null);
      setResult(null);
      setIndex((prev: number) => prev + 1);
    }
  }, [currentQuestion, selected, showGameOver, index, activeQuestions.length]);

  // Lock out if global picture attempts already exhausted
  useEffect(() => {
    if (progress?.isComplete) {
      setShowGameOver(true);
    }
  }, [progress?.isComplete]);

  const handleBackForfeit = useCallback(() => {
    forfeitGame.mutate({});
    navigate("/games");
  }, [forfeitGame, navigate]);

  if (isLoading) {
    return (
      <MobileContainer>
        <PageHeader title="ਤਸਵੀਰ ਪਛਾਣ" showBack onBack={handleBackForfeit} />
        <div className="flex-1 p-4 grid gap-4">
          <Skeleton className="h-72 rounded-[32px]" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </MobileContainer>
    );
  }

  if (showGameOver) {
    const allCorrect = index >= activeQuestions.length - 1 && result?.correct;
    return (
      <MobileContainer className="bg-gradient-to-b from-[#FAF6EE] to-[#E8E0D0]">
        <PageHeader title="ਤਸਵੀਰ ਪਛਾਣ" showBack onBack={handleBackForfeit} />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="w-full max-w-xl bg-white rounded-[32px] border-4 border-[#e8e0d0] shadow-xl p-8 space-y-5">
            <div className="text-7xl">{allCorrect ? "🎉" : "🖼️"}</div>
            <h2 className="text-3xl font-black text-primary">
              {allCorrect ? "ਸਾਰੇ ਸਹੀ!" : "ਮੌਕੇ ਪੂਰੇ ਹੋ ਗਏ!"}
            </h2>
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
      <PageHeader title="ਤਸਵੀਰ ਪਛਾਣ" subtitle={`ਮੌਕੇ: ${progress?.used ?? 0}/${progress?.limit ?? 0} — ਬਾਕੀ ਕੋਸ਼ਿਸ਼ਾਂ: ${attemptsLeft}`} showBack onBack={handleBackForfeit} />
      <div className="flex-1 grid content-stretch gap-4 p-4 sm:p-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <motion.div
          key={`${currentQuestion.id}-${shakeKey}`}
          initial={{ opacity: 0, scale: 0.96, x: 0 }}
          animate={shakeKey > 0 && !result?.correct ? { opacity: 1, scale: 1, x: [0, -12, 12, -12, 12, 0] } : { opacity: 1, scale: 1, x: 0 }}
          transition={shakeKey > 0 && !result?.correct ? { duration: 0.4 } : { duration: 0.3 }}
          className="bg-white/95 border-4 border-white rounded-[36px] shadow-xl p-4 sm:p-6 flex flex-col items-center justify-center min-h-[300px] md:min-h-[520px]"
        >
          <div className="w-full flex-1 rounded-[28px] bg-gradient-to-br from-green-50 to-yellow-50 border-4 border-green-100 flex items-center justify-center overflow-hidden">
            {currentQuestion.imageUrl ? (
              <img src={currentQuestion.imageUrl} alt="ਤਸਵੀਰ" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[9rem] sm:text-[12rem] leading-none drop-shadow-sm">{currentQuestion.imageEmoji}</span>
            )}
          </div>
          <p className="mt-4 text-center text-xl sm:text-2xl font-black text-primary">ਇਹ ਕੌਣ ਹੈ?</p>
        </motion.div>

        <div className="flex flex-col justify-center gap-3 sm:gap-4">
          {shuffledOptions.map((option: string, optionIndex: number) => {
            const isSelected = selected === option;
            const isCorrect = result?.correct && option === result.correctAnswer;
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
            {result && result.correct && (
              <motion.div initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="rounded-[28px] border-4 p-5 text-center shadow-xl bg-green-50 border-green-200">
                <div className="text-6xl mb-2">🎉</div>
                <h2 className="text-3xl font-black text-green-700">ਸਹੀ!</h2>
                <p className="font-bold text-muted-foreground mt-1">ਸਹੀ ਜਵਾਬ: <span className="text-foreground text-xl font-black">{result.correctAnswer}</span></p>
                <p className="font-black text-primary mt-2">+{result.pointsEarned} ਅੰਕ</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wrong answer inline feedback */}
          {selected && !result?.correct && attemptsLeft > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border-4 p-4 text-center shadow-xl bg-red-50 border-red-200">
              <div className="text-4xl mb-1">😬</div>
              <h2 className="text-xl font-black text-red-600">ਓਹੋ! ਗਲਤ ਜਵਾਬ</h2>
              <p className="text-sm font-bold text-muted-foreground mt-1">{attemptsLeft} ਕੋਸ਼ਿਸ਼ਾਂ ਬਾਕੀ — ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ!</p>
            </motion.div>
          )}

          {/* Skip button */}
          {!selected && (
            <button
              onClick={handleSkip}
              disabled={showGameOver}
              className="w-full h-12 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 font-bold text-sm hover:border-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <SkipForward className="w-4 h-4" />
              ਛੱਡੋ (ਕੋਈ ਅੰਕ ਨਹੀਂ)
            </button>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
