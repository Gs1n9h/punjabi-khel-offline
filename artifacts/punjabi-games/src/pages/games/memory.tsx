import { useState, useEffect, useRef, useCallback } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
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

const PUNJABI_DIGITS = ["੦","੧","੨","੩","੪","੫","੬","੭","੮","੯"];

function toPunjabi(numStr: string): string {
  return numStr.split("").map(d => PUNJABI_DIGITS[Number(d)] || d).join("");
}

function generateNumber(digits: number): string {
  if (digits === 1) return String(Math.floor(Math.random() * 9) + 1);
  let num = String(Math.floor(Math.random() * 9) + 1);
  for (let i = 1; i < digits; i++) num += String(Math.floor(Math.random() * 10));
  return num;
}

function ElapsedTimer({ active, hideStartRef }: { active: boolean; hideStartRef: { current: number } }) {
  const [ms, setMs] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      setMs(Date.now() - hideStartRef.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [active]);

  const s = (ms / 1000).toFixed(2);
  return (
    <div className="bg-white border-2 border-purple-200 rounded-2xl px-6 py-2 shadow-sm">
      <p className="text-[10px] text-muted-foreground font-bold uppercase text-center">Time</p>
      <p className="text-2xl font-black text-purple-700 tabular-nums text-center">{s}s</p>
    </div>
  );
}

export default function MemoryGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(1);
  const [currentNumber, setCurrentNumber] = useState("");
  const [userInput, setUserInput] = useState("");
  const [inputDisplay, setInputDisplay] = useState(""); // Punjabi display
  const [totalPoints, setTotalPoints] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [progress, setProgress] = useState(100);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number>(() => {
    const raw = localStorage.getItem("yaad-best-time");
    return raw ? Number(raw) : 0;
  });
  const [levelTimes, setLevelTimes] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideStartRef = useRef<number>(0);
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
    setInputDisplay("");
    setProgress(100);
    setPhase("showing");

    const duration = getShowDuration(lvl);
    const showStart = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - showStart;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
    }, 50);

    timerRef.current = setTimeout(() => {
      clearInterval(progressRef.current!);
      setProgress(0);
      hideStartRef.current = Date.now();
      setElapsedMs(0);
      setPhase("hiding");
    }, duration);
  }, []);

  const handleStart = () => {
    setLevel(1);
    setTotalPoints(0);
    setUserInput("");
    setInputDisplay("");
    startLevel(1);
  };

  const handleKeyPress = (arabicDigit: string) => {
    if (phase !== "hiding") return;
    const next = userInput + arabicDigit;
    setUserInput(next);
    setInputDisplay(toPunjabi(next));
    if (next.length >= currentNumber.length) {
      const t = Date.now() - hideStartRef.current;
      setElapsedMs(t);
      handleCheck(next, t);
    }
  };

  const handleBackspace = () => {
    if (phase !== "hiding") return;
    const next = userInput.slice(0, -1);
    setUserInput(next);
    setInputDisplay(toPunjabi(next));
  };

  const handleCheck = (input?: string, timeMs?: number) => {
    clearTimers();
    const val = input ?? userInput;
    if (val.trim() === currentNumber) {
      const t = timeMs ?? elapsedMs;
      const newTimes = [...levelTimes, t];
      setLevelTimes(newTimes);
      const newBest = bestTime === 0 ? t : Math.min(bestTime, t);
      setBestTime(newBest);
      localStorage.setItem("yaad-best-time", String(newBest));
      setLastTime(t);
      const pts = level * 10;
      setTotalPoints((p: number) => p + pts);
      setPhase("correct");
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 }, colors: ["#E8721A", "#FFD700", "#4CAF50"] });
      setTimeout(() => {
        setLevel((l: number) => l + 1);
        startLevel(level + 1);
      }, 1200);
    } else {
      setPhase("wrong");
      setTimeout(() => setPhase("gameover"), 1000);
    }
  };

  useEffect(() => {
    if (phase === "gameover" && level > 1) {
      const avg = levelTimes.length ? Math.round(levelTimes.reduce((a: number, b: number) => a + b, 0) / levelTimes.length) : 0;
      submitSession.mutate({ data: { maxLevel: level - 1, pointsEarned: totalPoints, bestTime, avgTime: avg } });
    }
  }, [phase]);

  useEffect(() => () => clearTimers(), []);

  if (showLeaderboard) {
    return (
      <MobileContainer className="bg-gradient-to-b from-purple-50 to-blue-50">
        <PageHeader title="ਯਾਦ ਖੇਡ" subtitle="ਸਭ ਤੋਂ ਵਧੀਆ ਯਾਦ ਰੱਖਣ ਵਾਲੇ" showBack backHref="/games" />
        <div className="p-4 space-y-3">
          {leaderboard?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground font-bold">ਕੋਈ ਐਂਟਰੀ ਨਹੀਂ — ਪਹਿਲੇ ਬਣੋ!</div>
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
              {entry.bestTime ? (
                <div className="text-right min-w-[60px]">
                  <p className="font-black text-green-700">{(entry.bestTime / 1000).toFixed(2)}s</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">time</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer className="bg-gradient-to-b from-purple-50 to-blue-50">
      <PageHeader title="ਯਾਦ ਖੇਡ" subtitle="ਨੰਬਰ ਯਾਦ ਕਰਨ ਦੀ ਖੇਡ" showBack />

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
                <p className="text-muted-foreground font-medium">ਇੱਕ ਨੰਬਰ ਥੋੜ੍ਹੀ ਦੇਰ ਲਈ ਦਿਖਾਈ ਦਿੰਦਾ ਹੈ — ਇਸ ਨੂੰ ਯਾਦ ਰੱਖੋ!</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border-2 border-purple-100 w-full text-left space-y-2 shadow-sm">
                <p className="font-bold text-sm text-purple-700">ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ:</p>
                <p className="text-xs text-muted-foreground">• ਇੱਕ ਨੰਬਰ ਸਕ੍ਰੀਨ 'ਤੇ ਥੋੜ੍ਹੀ ਦੇਰ ਲਈ ਆਉਂਦਾ ਹੈ</p>
                <p className="text-xs text-muted-foreground">• ਇਸ ਨੂੰ ਯਾਦ ਰੱਖੋ — ਫਿਰ ਦਾਖਲ ਕਰੋ</p>
                <p className="text-xs text-muted-foreground">• ਹਰ ਪੱਧਰ ਵਿੱਚ ਇੱਕ ਹੋਰ ਅੰਕ ਜੁੜਦਾ ਹੈ</p>
                <p className="text-xs text-muted-foreground">• ਹਰ ਸਹੀ ਜਵਾਬ 'ਤੇ 10×ਪੱਧਰ ਅੰਕ</p>
              </div>
              <div className="flex gap-3 w-full">
                <Button onClick={handleStart} className="flex-1 h-14 text-xl rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 transition-all">
                  ਸ਼ੁਰੂ ਕਰੋ!
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
                <span className="text-sm font-bold text-purple-600 uppercase tracking-wide">ਪੱਧਰ {level}</span>
                <span className="text-sm text-muted-foreground">— {level} ਅੰਕ{level !== 1 ? "" : ""}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-purple-500 rounded-full" style={{ width: `${progress}%` }} />
              </div>

              {/* Countdown above number */}
              <motion.div
                key={progress > 66 ? "3" : progress > 33 ? "2" : "1"}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center"
              >
                <div className="w-20 h-20 bg-red-500/90 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-white">
                  {progress > 66 ? "3" : progress > 33 ? "2" : "1"}
                </div>
              </motion.div>

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
                <div className="relative bg-white rounded-3xl border-4 border-purple-200 shadow-xl px-12 py-10 flex items-center justify-center min-h-[140px] w-full">
                  <span className="text-6xl font-black tracking-widest text-purple-700 select-none">{toPunjabi(currentNumber)}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground font-medium">ਇਹ ਨੰਬਰ ਯਾਦ ਕਰੋ!</p>
            </motion.div>
          )}

          {/* HIDING — user types with Punjabi keypad */}
          {phase === "hiding" && (
            <motion.div key="hiding" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 w-full max-w-xs">
              {/* Timer during hiding */}
              <ElapsedTimer active={phase === "hiding"} hideStartRef={hideStartRef} />
              <div className="bg-gradient-to-b from-purple-500 to-blue-500 rounded-3xl p-5 text-center shadow-xl w-full">
                <div className="text-5xl mb-2">🤚</div>
                <p className="text-white font-black text-lg">ਤੁਸੀਂ ਕੀ ਵੇਖਿਆ?</p>
                <p className="text-white/70 text-sm mt-1">ਪੱਧਰ {level} — {level} ਅੰਕ{level !== 1 ? "" : ""}</p>
              </div>

              {/* Display area */}
              <div className="w-full h-16 bg-white border-2 border-purple-200 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-4xl font-black text-purple-700 tracking-[0.2em] select-none">
                  {inputDisplay || <span className="text-purple-200">?</span>}
                </span>
              </div>

              {/* Punjabi keypad — standard phone layout */}
              <div className="w-full grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6,7,8,9].map(i => (
                  <button
                    key={i}
                    onClick={() => handleKeyPress(String(i))}
                    className="h-16 bg-white border-2 border-purple-200 rounded-2xl text-3xl font-black text-purple-700 shadow-sm active:bg-purple-50 active:scale-95 transition-all"
                  >
                    {PUNJABI_DIGITS[i]}
                  </button>
                ))}
                <div /> {/* empty cell */}
                <button
                  onClick={() => handleKeyPress("0")}
                  className="h-16 bg-white border-2 border-purple-200 rounded-2xl text-3xl font-black text-purple-700 shadow-sm active:bg-purple-50 active:scale-95 transition-all"
                >
                  {PUNJABI_DIGITS[0]}
                </button>
                <button
                  onClick={handleBackspace}
                  className="h-16 bg-purple-50 border-2 border-purple-200 rounded-2xl text-lg font-bold text-purple-700 shadow-sm active:bg-purple-100 active:scale-95 transition-all flex items-center justify-center"
                >
                  ←
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">ਕੁੱਲ ਅੰਕ: <span className="font-black text-purple-700">{totalPoints}</span></p>
              </div>
            </motion.div>
          )}

          {/* CORRECT */}
          {phase === "correct" && (
            <motion.div key="correct" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 text-center">
              <div className="text-7xl">🎉</div>
              <h2 className="text-3xl font-black text-green-600">ਸਹੀ!</h2>
              {lastTime !== null && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl px-6 py-2">
                  <p className="text-xs text-green-600 font-bold uppercase">ਸਮਾਂ</p>
                  <p className="text-2xl font-black text-green-700">{(lastTime / 1000).toFixed(2)}s</p>
                  {bestTime > 0 && bestTime === lastTime && <p className="text-[10px] text-green-600 font-bold">ਨਵਾਂ ਰਿਕਾਰਡ!</p>}
                </div>
              )}
              <p className="text-muted-foreground font-bold">+{level * 10} ਅੰਕ</p>
              <p className="text-sm font-bold text-purple-700">ਪੱਧਰ {level + 1} ਆ ਰਿਹਾ ਹੈ…</p>
            </motion.div>
          )}

          {/* WRONG */}
          {phase === "wrong" && (
            <motion.div key="wrong" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 text-center">
              <div className="text-7xl">😬</div>
              <h2 className="text-3xl font-black text-red-500">ਓਹੋ!</h2>
              <p className="text-muted-foreground font-bold">ਨੰਬਰ ਸੀ <span className="font-black text-foreground text-2xl">{toPunjabi(currentNumber)}</span></p>
            </motion.div>
          )}

          {/* GAME OVER */}
          {phase === "gameover" && (
            <motion.div key="gameover" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 text-center w-full max-w-xs">
              <div className="text-7xl">🧠</div>
              <div>
                <h2 className="text-3xl font-black text-purple-700">ਖੇਡ ਖਤਮ!</h2>
                <p className="text-muted-foreground mt-1">ਤੁਸੀਂ ਪਹੁੰਚੇ</p>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-black text-purple-700">{Math.max(1, level - 1)}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">ਸਭ ਤੋਂ ਵਧੀਆ ਪੱਧਰ</p>
                </div>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 text-center">
                  <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-2xl font-black text-yellow-700">{totalPoints}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">ਅੰਕ</p>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-green-700">{bestTime ? (bestTime / 1000).toFixed(2) : "—"}s</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ</p>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <Button onClick={handleStart} className="flex-1 h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg border-b-4 border-purple-800">
                  <RotateCcw className="w-5 h-5 mr-2" /> ਦੁਬਾਰਾ ਖੇਡੋ
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
