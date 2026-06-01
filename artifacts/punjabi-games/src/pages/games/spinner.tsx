import { useState } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { useListSpinnerConfigs, useRecordSpin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { motion, useAnimationControls } from "framer-motion";
import confetti from "canvas-confetti";
import { Skeleton } from "@/components/ui/skeleton";
import { getListSpinnerConfigsQueryKey } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";

export default function SpinnerGame() {
  const { data: configs, isLoading } = useListSpinnerConfigs();
  const recordSpin = useRecordSpin();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const controls = useAnimationControls();

  const activeConfig = configs?.find(c => c.isActive) || configs?.[0];

  const handleSpin = async () => {
    if (!activeConfig || isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);

    const items = activeConfig.items;
    // Calculate weights
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    
    for (let i = 0; i < items.length; i++) {
      random -= (items[i].weight || 1);
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    const selectedItem = items[selectedIndex];

    // Calculate rotation to land on selected index
    // Note: this assumes items are evenly spaced visually even if weights differ, 
    // or we'd need to draw slices proportionally. We'll assume visually even slices.
    const sliceAngle = 360 / items.length;
    // Target angle (top is 0)
    const targetAngle = 360 - (selectedIndex * sliceAngle) - (sliceAngle / 2);
    const extraSpins = 5 * 360;
    const finalRotation = rotation + extraSpins + (targetAngle - (rotation % 360));

    await controls.start({
      rotate: finalRotation,
      transition: { duration: 4, ease: [0.2, 0.8, 0.2, 1] }
    });

    setRotation(finalRotation);
    setResult(selectedItem.label);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E8721A', '#1A56E8', '#FFD700']
    });

    recordSpin.mutate({
      data: { configId: activeConfig.id, resultLabel: selectedItem.label }
    }, {
      onSuccess: () => {
        // Points awarded via backend
      }
    });

    setIsSpinning(false);
  };

  if (isLoading) {
    return (
      <MobileContainer>
        <PageHeader title="Charkha" showBack />
        <div className="flex-1 flex items-center justify-center p-4">
          <Skeleton className="w-64 h-64 rounded-full" />
        </div>
      </MobileContainer>
    );
  }

  if (!activeConfig || activeConfig.items.length === 0) {
    return (
      <MobileContainer>
        <PageHeader title="Charkha" showBack />
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground font-bold">No spinner configured.</p>
        </div>
      </MobileContainer>
    );
  }

  const items = activeConfig.items;

  return (
    <MobileContainer className="bg-gradient-to-b from-[#FFF8F0] to-orange-100">
      <PageHeader title="Charkha" subtitle={activeConfig.name} showBack />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Pointer */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[140px] z-20 w-8 h-12 bg-primary flex items-center justify-center drop-shadow-md rounded-b-full">
           <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-[16px] border-t-white absolute -bottom-3"></div>
        </div>

        {/* Wheel */}
        <motion.div 
          animate={controls}
          className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-8 border-white shadow-2xl overflow-hidden"
          style={{ transformOrigin: "center center" }}
        >
          {items.map((item, index) => {
            const angle = 360 / items.length;
            const rotate = index * angle;
            const defaultColors = ["#E8721A", "#1A56E8", "#FFB300", "#4CAF50", "#E91E63", "#9C27B0"];
            const color = item.color || defaultColors[index % defaultColors.length];
            
            return (
              <div
                key={index}
                className="absolute inset-0 w-full h-full origin-center"
                style={{
                  transform: `rotate(${rotate}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan((angle * Math.PI) / 180)}% 0%)`,
                  backgroundColor: color
                }}
              >
                <div 
                  className="absolute top-4 left-1/2 -translate-x-1/2 origin-bottom font-bold text-white uppercase tracking-wider drop-shadow-md text-sm sm:text-lg"
                  style={{
                    transform: `rotate(${angle / 2}deg) translateX(-50%)`,
                    transformOrigin: "bottom center",
                    height: "50%",
                    width: "100%",
                    textAlign: "center"
                  }}
                >
                  {item.label}
                </div>
              </div>
            );
          })}
          
          <div className="absolute inset-0 rounded-full border-[16px] border-black/10 pointer-events-none" />
          
          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-primary shadow-inner z-10" />
        </motion.div>

        <div className="mt-12 w-full max-w-xs space-y-6">
          <Button 
            onClick={handleSpin} 
            disabled={isSpinning}
            className="w-full h-16 text-xl rounded-2xl bg-primary hover:bg-[#D4600E] text-white shadow-lg shadow-orange-200 border-b-4 border-[#C25000] active:border-b-0 active:translate-y-1 transition-all"
          >
            {isSpinning ? "Spinning..." : "SPIN!"}
          </Button>

          {result && !isSpinning && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 text-center border-4 border-orange-100 shadow-xl"
            >
              <p className="text-sm font-bold text-muted-foreground uppercase mb-1">You got</p>
              <p className="text-3xl font-black text-primary">{result}</p>
            </motion.div>
          )}
        </div>

      </div>
    </MobileContainer>
  );
}
