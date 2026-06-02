import { useState, useEffect, useRef, useCallback } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useSubmitMemoryGameSession, useGetMemoryGameLeaderboard } from "@/lib/offline-api";
import confetti from "canvas-confetti";
import { Brain, Trophy, Star, RotateCcw, Medal } from "lucide-react";

type Phase = "idle" | "showing" | "hiding" | "correct" | "wrong" | "gameover";

function getShowDuration(level: number): number {
  if (level <= 3) return 2500;
  if (level <= 6) return 2000;
  if (level <= 9) return 1500;
  return 1000;
}

function generateNumber(digits: number): string {
  if (digits === 1) return String(Math.floor(Math.random() * 9) + 1);
  let num = String(Math.floor(Math.random() * 9) + 1);
  for (let i = 1; i < digits; i++) num += String(Math.floor(Math.random() * 10));
  return num;
}

export default function MemoryGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(1);
  const [currentNumber, setCurrentNumber] = useState("");
  const [userInput, setUserInput] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitSession = useSubmitMemoryGameSession();
  const { data: leaderboard } = useGetMemoryGameLeaderboard({ params: { limit: 10 } });

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  };

  const startLevel = useCallback((lvl: number) => {
    const num = generateNumber(lvl);
    setCurrentNumber(num);
    setUserInput("");
    setProgress(100);
    setPhase("showing");

    const duration = getShowDuration(lvl);
    const startTime = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
    }, 50);

    timerRef.current = setTimeout(() => {
      clearInterval(progressRef.current!);
      setProgress(0);
      setPhase("hiding");
      setTimeout(() => inputRef.current?.focus(), 100);
    }, duration);
  }, []);

  const handleStart = () => {
    setLevel(1);
    setTotalPoints(0);
    startLevel(1);
  };

  const handleCheck = () => {
    clearTimers();
    if (userInput.trim() === currentNumber) {
      const pts = level * 10;
      setTotalPoints((p) => p + pts);
      setPhase("correct");
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 }, colors: ["#E8721A", "#FFD700", "#4CAF50"] });
      setTimeout(() => {
        setLevel((l) => l + 1);
        startLevel(level + 1);
      }, 1200);
    } else {
      setPhase("wrong");
      setTimeout(() => setPhase("gameover"), 1000);
    }
  };

  useEffect(() => {
    if (phase === "gameover" && level > 1) {
      submitSession.mutate({ data: { maxLevel: level - 1, pointsEarned: totalPoints } });
    }
  }, [phase]);

  useEffect(() => () => clearTimers(), []);

  if (showLeaderboard) {
    return (
      <MobileContainer className="bg-gradient-to-b from-purple-50 to-blue-50">
        <PageHeader title="Yaad Khel" subtitle="Best Memory Players" showBack onBack={() => setShowLeaderboard(false)} />
        <div className="p-4 space-y-3">
          {leaderboard?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground font-bold">No entries yet — be first!</div>
          )}
          {leaderboard?.map((entry, i) => (
            <div key={entry.userId} className="flex items-center gap-3 bg-white rounded-2xl p-3 border-2 border-purple-100 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm
                ${i === 0 ? "bg-yellow-400 text-white" : i === 1 ? "bg-slate-300 text-white" : i === 2 ? "bg-amber-600 text-white" : "bg-purple-100 text-purple-700"}`}>
                {i === 0 ? <Trophy className="w-5 h-5" /> : i === 1 ? <Medal className="w-5 h-5" /> : i === 2 ? <Medal className="w-5 h-5" /> : entry.rank}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{entry.displayName || entry.username}</p>
                <p className="text-xs text-muted-foreground">{entry.gamesPlayed} games</p>
              </div>
              <div className="text-right">
                <p className="font-black text-purple-700">Lvl {entry.bestLevel}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">best</p>
              </div>
            </div>
          ))}
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer className="bg-gradient-to-b from-purple-50 to-blue-50">
      <PageHeader title="Yaad Khel" subtitle="Number Memory Game" showBack />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">

          {/* IDLE */}
          {phase === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-8 text-center w-full max-w-xs">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-400/20 blur-3xl rounded-full" />
                <div className="w-32 h-32 bg-white rounded-3xl border-4 border-purple-200 flex items-center justify-center shadow-xl relative z-10">
                  <Brain className="w-16 h-16 text-purple-500" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-purple-700 mb-2">ਯਾਦ ਖੇਡ</h2>
                <p className="text-muted-foreground font-medium">A number flashes briefly — remember it and type it!</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border-2 border-purple-100 w-full text-left space-y-2 shadow-sm">
                <p className="font-bold text-sm text-purple-700">How it works:</p>
                <p className="text-xs text-muted-foreground">• A number appears on screen for a moment</p>
                <p className="text-xs text-muted-foreground">• Remember it — then type what you saw</p>
                <p className="text-xs text-muted-foreground">• Each level adds one more digit</p>
                <p className="text-xs text-muted-foreground">• Earn 10×level points per correct answer</p>
              </div>
              <div className="flex gap-3 w-full">
                <Button onClick={handleStart} className="flex-1 h-14 text-xl rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 transition-all">
                  Start!
                </Button>
                <Button variant="outline" onClick={() => setShowLeaderboard(true)} className="h-14 w-14 rounded-2xl border-2 border-purple-200">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* SHOWING */}
          {phase === "showing" && (
            <motion.div key="showing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 w-full max-w-xs">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-purple-600 uppercase tracking-wide">Level {level}</span>
                <span className="text-sm text-muted-foreground">— {level} digit{level !== 1 ? "s" : ""}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-purple-500 rounded-full" style={{ width: `${progress}%` }} />
              </div>

              {/* Hand reveal */}
              <div className="relative w-full flex items-center justify-center">
                <motion.div
                  key="cover-hand"
                  initial={{ y: 0 }}
                  animate={{ y: "-110%" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 z-10 bg-gradient-to-b from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center text-7xl shadow-2xl"
                >
                  🤚
                </motion.div>
                <div className="bg-white rounded-3xl border-4 border-purple-200 shadow-xl px-12 py-8 flex items-center justify-center min-h-[120px] w-full">
                  <span className="text-6xl font-black tracking-widest text-purple-700 select-none">{currentNumber}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground font-medium">Memorise this number!</p>
            </motion.div>
          )}

          {/* HIDING — user types */}
          {phase === "hiding" && (
            <motion.div key="hiding" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 w-full max-w-xs">
              <div className="bg-gradient-to-b from-purple-500 to-blue-500 rounded-3xl p-6 text-center shadow-xl w-full">
                <div className="text-6xl mb-3">🤚</div>
                <p className="text-white font-black text-xl">What did you see?</p>
                <p className="text-white/70 text-sm mt-1">Level {level} — {level} digit{level !== 1 ? "s" : ""}</p>
              </div>

              <div className="w-full space-y-3">
                <Input
                  ref={inputRef}
                  type="number"
                  inputMode="numeric"
                  placeholder="Type the number…"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && userInput && handleCheck()}
                  className="h-16 text-center text-2xl font-black border-2 border-purple-200 focus:border-purple-500 rounded-2xl"
                  autoFocus
                />
                <Button
                  onClick={handleCheck}
                  disabled={!userInput}
                  className="w-full h-14 text-lg rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 transition-all"
                >
                  Check!
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">Points so far: <span className="font-black text-purple-700">{totalPoints}</span></p>
              </div>
            </motion.div>
          )}

          {/* CORRECT */}
          {phase === "correct" && (
            <motion.div key="correct" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 text-center">
              <div className="text-7xl">🎉</div>
              <h2 className="text-3xl font-black text-green-600">Correct!</h2>
              <p className="text-muted-foreground font-bold">+{level * 10} points</p>
              <p className="text-sm font-bold text-purple-700">Level {level + 1} coming up…</p>
            </motion.div>
          )}

          {/* WRONG */}
          {phase === "wrong" && (
            <motion.div key="wrong" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 text-center">
              <div className="text-7xl">😬</div>
              <h2 className="text-3xl font-black text-red-500">Oops!</h2>
              <p className="text-muted-foreground font-bold">The number was <span className="font-black text-foreground">{currentNumber}</span></p>
            </motion.div>
          )}

          {/* GAME OVER */}
          {phase === "gameover" && (
            <motion.div key="gameover" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 text-center w-full max-w-xs">
              <div className="text-7xl">🧠</div>
              <div>
                <h2 className="text-3xl font-black text-purple-700">Game Over!</h2>
                <p className="text-muted-foreground mt-1">You reached</p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 text-center">
                  <p className="text-4xl font-black text-purple-700">{Math.max(1, level - 1)}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Best Level</p>
                </div>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                  <p className="text-4xl font-black text-yellow-700">{totalPoints}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Points</p>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <Button onClick={handleStart} className="flex-1 h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg border-b-4 border-purple-800">
                  <RotateCcw className="w-5 h-5 mr-2" /> Play Again
                </Button>
                <Button variant="outline" onClick={() => setShowLeaderboard(true)} className="h-14 w-14 rounded-2xl border-2 border-purple-200">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </MobileContainer>
  );
}
