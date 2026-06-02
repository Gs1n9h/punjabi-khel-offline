import { useState, useEffect, useRef } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { useListSpinnerConfigs, useRecordSpin } from "@/lib/offline-api";
import { Button } from "@/components/ui/button";
import { motion, useAnimationControls } from "framer-motion";
import confetti from "canvas-confetti";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MoreVertical } from "lucide-react";

type DisplayMode = "wheel" | "slot-vertical" | "slot-horizontal" | "flash";

const DEFAULT_COLORS = ["#E8721A", "#1A56E8", "#FFB300", "#4CAF50", "#E91E63", "#9C27B0", "#00BCD4", "#FF5722"];

// ─── Wheel Mode ───────────────────────────────────────────────────
function WheelDisplay({ items, isSpinning, result, onSpin }: { items: any[], isSpinning: boolean, result: string | null, onSpin: () => void }) {
  const [rotation, setRotation] = useState(0);
  const controls = useAnimationControls();

  const spin = async (selectedIndex: number) => {
    const sliceAngle = 360 / items.length;
    const targetAngle = 360 - (selectedIndex * sliceAngle) - (sliceAngle / 2);
    const extraSpins = 5 * 360;
    const finalRotation = rotation + extraSpins + (targetAngle - (rotation % 360));
    await controls.start({ rotate: finalRotation, transition: { duration: 4, ease: [0.2, 0.8, 0.2, 1] } });
    setRotation(finalRotation);
  };

  useEffect(() => {
    if (isSpinning) {
      const totalWeight = items.reduce((s: number, i: any) => s + (i.weight || 1), 0);
      let r = Math.random() * totalWeight;
      let idx = 0;
      for (let i = 0; i < items.length; i++) { r -= (items[i].weight || 1); if (r <= 0) { idx = i; break; } }
      spin(idx);
    }
  }, [isSpinning]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="relative">
        {/* Needle */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-primary drop-shadow-lg" style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.35))' }} />
        </div>
        <motion.div animate={controls} className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-8 border-white shadow-2xl overflow-hidden" style={{ transformOrigin: "center center" }}>
        {items.map((item: any, index: number) => {
          const angle = 360 / items.length;
          const rotate = index * angle;
          const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
          const fontSize = items.length > 30 ? "text-[8px]" : items.length > 20 ? "text-[10px]" : items.length > 10 ? "text-xs" : "text-sm sm:text-lg";
          const topPos = items.length > 20 ? "top-[26%]" : "top-2 sm:top-4";
          const textHeight = items.length > 20 ? "38%" : "50%";
          return (
            <div key={index} className="absolute inset-0 w-full h-full origin-center" style={{ transform: `rotate(${rotate}deg)`, clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan((angle * Math.PI) / 180)}% 0%)`, backgroundColor: color }}>
              <div className={`absolute ${topPos} left-1/2 -translate-x-1/2 origin-bottom font-bold text-white uppercase tracking-wider drop-shadow-md ${fontSize}`} style={{ transform: `rotate(${angle / 2}deg) translateX(-50%)`, transformOrigin: "bottom center", height: textHeight, width: "100%", textAlign: "center" }}>
                {item.label}
              </div>
            </div>
          );
        })}
        <div className="absolute inset-0 rounded-full border-[16px] border-black/10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-primary shadow-inner z-10" />
      </motion.div>
      </div>
      <SpinResult result={result} isSpinning={isSpinning} onSpin={onSpin} label="SPIN!" />
    </div>
  );
}

// ─── Slot Vertical ────────────────────────────────────────────────
function SlotVerticalDisplay({ items, isSpinning, result, onSpin }: { items: any[], isSpinning: boolean, result: string | null, onSpin: () => void }) {
  const ITEM_H = 80;
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSpinning) return;
    const totalWeight = items.reduce((s: number, i: any) => s + (i.weight || 1), 0);
    let r = Math.random() * totalWeight, targetIdx = 0;
    for (let i = 0; i < items.length; i++) { r -= (items[i].weight || 1); if (r <= 0) { targetIdx = i; break; } }

    const duration = 3500;
    const start = performance.now();
    const loops = 4;
    const targetOffset = -(targetIdx * ITEM_H + loops * items.length * ITEM_H);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = t < 0.7 ? t / 0.7 : 1 - ((t - 0.7) / 0.3) * ((t - 0.7) / 0.3) * 0.5;
      setOffset(targetOffset * ease);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isSpinning]);

  const tripled = [...items, ...items, ...items, ...items, ...items];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
      <div className="w-52 overflow-hidden rounded-2xl border-4 border-primary shadow-2xl bg-white" style={{ height: ITEM_H }}>
        <div style={{ transform: `translateY(${offset}px)` }} className="transition-none">
          {tripled.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-center font-black text-2xl" style={{ height: ITEM_H, backgroundColor: item.color || DEFAULT_COLORS[i % items.length % DEFAULT_COLORS.length], color: "white" }}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
      <SpinResult result={result} isSpinning={isSpinning} onSpin={onSpin} label="▼ SPIN ▼" />
    </div>
  );
}

// ─── Slot Horizontal ─────────────────────────────────────────────
function SlotHorizontalDisplay({ items, isSpinning, result, onSpin }: { items: any[], isSpinning: boolean, result: string | null, onSpin: () => void }) {
  const ITEM_W = 120;
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSpinning) return;
    const totalWeight = items.reduce((s: number, i: any) => s + (i.weight || 1), 0);
    let r = Math.random() * totalWeight, targetIdx = 0;
    for (let i = 0; i < items.length; i++) { r -= (items[i].weight || 1); if (r <= 0) { targetIdx = i; break; } }

    const duration = 3500;
    const start = performance.now();
    const loops = 4;
    const targetOffset = -(targetIdx * ITEM_W + loops * items.length * ITEM_W);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = t < 0.7 ? t / 0.7 : 1 - ((t - 0.7) / 0.3) * ((t - 0.7) / 0.3) * 0.5;
      setOffset(targetOffset * ease);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isSpinning]);

  const tripled = [...items, ...items, ...items, ...items, ...items];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
      <div className="overflow-hidden rounded-2xl border-4 border-primary shadow-2xl bg-white" style={{ width: ITEM_W, height: 80 }}>
        <div style={{ transform: `translateX(${offset}px)`, display: "flex" }} className="transition-none">
          {tripled.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-center font-black text-2xl shrink-0" style={{ width: ITEM_W, height: 80, backgroundColor: item.color || DEFAULT_COLORS[i % items.length % DEFAULT_COLORS.length], color: "white" }}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
      <SpinResult result={result} isSpinning={isSpinning} onSpin={onSpin} label="◄► SPIN" />
    </div>
  );
}

// ─── Flash Mode ───────────────────────────────────────────────────
function FlashDisplay({ items, isSpinning, result, onSpin }: { items: any[], isSpinning: boolean, result: string | null, onSpin: () => void }) {
  const [flashIdx, setFlashIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isSpinning) return;
    const totalWeight = items.reduce((s: number, i: any) => s + (i.weight || 1), 0);
    let r = Math.random() * totalWeight, targetIdx = 0;
    for (let i = 0; i < items.length; i++) { r -= (items[i].weight || 1); if (r <= 0) { targetIdx = i; break; } }

    let delay = 80;
    let idx = 0;
    const startTime = Date.now();
    const totalDuration = 3000;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / totalDuration;
      idx = (idx + 1) % items.length;
      setFlashIdx(idx);
      delay = 80 + progress * 400;
      if (elapsed < totalDuration) {
        intervalRef.current = setTimeout(tick, delay);
      } else {
        setFlashIdx(targetIdx);
      }
    };
    intervalRef.current = setTimeout(tick, delay);
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  }, [isSpinning]);

  const item = items[flashIdx];
  const color = item?.color || DEFAULT_COLORS[flashIdx % DEFAULT_COLORS.length];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
      <motion.div
        key={flashIdx}
        initial={{ scale: 0.85, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-52 h-52 rounded-3xl border-8 border-white shadow-2xl flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        <span className="text-5xl font-black text-white drop-shadow-lg">{item?.label}</span>
      </motion.div>
      <SpinResult result={result} isSpinning={isSpinning} onSpin={onSpin} label="⚡ FLASH!" />
    </div>
  );
}

// ─── Shared result + button ───────────────────────────────────────
function SpinResult({ result, isSpinning, onSpin, label }: { result: string | null, isSpinning: boolean, onSpin: () => void, label: string }) {
  return (
    <div className="w-full max-w-xs space-y-4">
      <Button onClick={onSpin} disabled={isSpinning} className="w-full h-16 text-xl rounded-2xl bg-primary hover:bg-[#D4600E] text-white shadow-lg shadow-orange-200 border-b-4 border-[#C25000] active:border-b-0 active:translate-y-1 transition-all">
        {isSpinning ? "Spinning…" : label}
      </Button>
      {result && !isSpinning && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 text-center border-4 border-orange-100 shadow-xl">
          <p className="text-sm font-bold text-muted-foreground uppercase mb-1">You got</p>
          <p className="text-3xl font-black text-primary">{result}</p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────
export default function SpinnerGame() {
  const { data: configs, isLoading } = useListSpinnerConfigs();
  const recordSpin = useRecordSpin();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeConfigId, setActiveConfigId] = useState<number | null>(null);
  const [overrideDisplayMode, setOverrideDisplayMode] = useState<DisplayMode | null>(null);

  const allConfigs = configs ?? [];
  const activeConfig = allConfigs.find(c => c.id === activeConfigId) || allConfigs.find(c => c.isActive) || allConfigs[0];
  const configDisplayMode: DisplayMode = (activeConfig?.displayMode as DisplayMode) || "wheel";
  const displayMode = overrideDisplayMode ?? configDisplayMode;

  const handleSpin = () => {
    if (!activeConfig || isSpinning || activeConfig.items.length === 0) return;
    setIsSpinning(true);
    setResult(null);

    const items = activeConfig.items as any[];
    const totalWeight = items.reduce((s: number, i: any) => s + (i.weight || 1), 0);
    let r = Math.random() * totalWeight, selectedIndex = 0;
    for (let i = 0; i < items.length; i++) { r -= (items[i].weight || 1); if (r <= 0) { selectedIndex = i; break; } }
    const selectedItem = items[selectedIndex];

    const spinDuration = (displayMode === "wheel") ? 4200 : 3700;
    setTimeout(() => {
      setResult(selectedItem.label);
      setIsSpinning(false);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#E8721A", "#1A56E8", "#FFD700"] });
      recordSpin.mutate({ data: { configId: activeConfig.id, resultLabel: selectedItem.label } });
    }, spinDuration);
  };

  if (isLoading) {
    return (
      <MobileContainer><PageHeader title="Charkha" showBack />
        <div className="flex-1 flex items-center justify-center p-4"><Skeleton className="w-64 h-64 rounded-full" /></div>
      </MobileContainer>
    );
  }

  if (!activeConfig || activeConfig.items.length === 0) {
    return (
      <MobileContainer><PageHeader title="Charkha" showBack />
        <div className="flex-1 flex items-center justify-center p-4"><p className="text-muted-foreground font-bold">No spinner configured.</p></div>
      </MobileContainer>
    );
  }

  const displayProps = { items: activeConfig.items as any[], isSpinning, result, onSpin: handleSpin };

  return (
    <MobileContainer className="bg-gradient-to-b from-[#FFF8F0] to-orange-100">
      <PageHeader title="Charkha" subtitle={activeConfig.name} showBack />

      {/* Config selector */}
      {allConfigs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar">
          {allConfigs.map(c => (
            <button key={c.id} onClick={() => { setActiveConfigId(c.id); setResult(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border-2 transition-all ${activeConfig.id === c.id ? "bg-primary text-white border-primary" : "bg-white border-orange-200 text-muted-foreground"}`}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Display mode selector */}
      <div className="flex justify-center py-1">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 text-[10px] uppercase font-bold px-2.5 py-1 bg-orange-100 text-primary rounded-full tracking-widest hover:bg-orange-200 transition-colors">
              {displayMode === "wheel" ? "Wheel" : displayMode === "slot-vertical" ? "Slot ↕" : displayMode === "slot-horizontal" ? "Slot ↔" : "Flash ⚡"}
              <MoreVertical className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2" align="center">
            <div className="space-y-1">
              {(["wheel", "slot-vertical", "slot-horizontal", "flash"] as DisplayMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setOverrideDisplayMode(mode === configDisplayMode ? null : mode)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    displayMode === mode ? "bg-primary text-white" : "hover:bg-orange-50 text-foreground"
                  }`}
                >
                  {mode === "wheel" ? "🎡 Wheel" : mode === "slot-vertical" ? "↕ Slot Vertical" : mode === "slot-horizontal" ? "↔ Slot Horizontal" : "⚡ Flash"}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {displayMode === "wheel" && <WheelDisplay {...displayProps} />}
      {displayMode === "slot-vertical" && <SlotVerticalDisplay {...displayProps} />}
      {displayMode === "slot-horizontal" && <SlotHorizontalDisplay {...displayProps} />}
      {displayMode === "flash" && <FlashDisplay {...displayProps} />}
    </MobileContainer>
  );
}
