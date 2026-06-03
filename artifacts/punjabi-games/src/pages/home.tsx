import { Link } from "wouter";
import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Home() {
  return (
    <MobileContainer className="bg-gradient-to-b from-[#FAF6EE] to-[#E8E0D0]">
      <div className="flex-1 flex flex-col px-6 pt-4 pb-8">
        {/* Top-right logo */}
        <div className="flex justify-end mb-2">
          <img
            src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.png`}
            alt="ਗੁਰਮੁਖੀ ਵੇਹੜਾ"
            className="w-14 h-14 rounded-full border-2 border-primary shadow-md"
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="mb-8 relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.svg`} alt="ਗੁਰਮੁਖੀ ਵੇਹੜਾ" className="w-48 h-48 drop-shadow-2xl relative z-10" />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-4 mb-12"
          >
            <h1 className="text-4xl font-black text-primary drop-shadow-sm tracking-tight leading-none">
              ਗੁਰਮੁਖੀ<br />
              <span className="text-secondary">ਵੇਹੜਾ</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium px-4">
              ਪੰਜਾਬੀ ਸਭਿਆਚਾਰ ਨੂੰ ਸਿੱਖੋ, ਖੇਡੋ ਅਤੇ ਮਨਾਓ!
            </p>
          </motion.div>

          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full space-y-4 mt-auto"
          >
            <Link href="/sign-up">
              <Button size="lg" className="w-full h-16 text-xl rounded-2xl bg-primary hover:bg-[#141b4d] text-white shadow-lg shadow-[#1a237e]/20 border-b-4 border-[#0f1540] active:border-b-0 active:translate-y-1 transition-all">
                ਖੇਡੋ
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="w-full h-16 text-lg rounded-2xl bg-white text-primary border-2 border-[#d4c9a8] hover:bg-[#f5f0e0] hover:border-primary shadow-sm border-b-4 active:border-b-2 active:translate-y-0.5 transition-all">
                ਮੇਰਾ ਖਾਤਾ ਹੈ
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </MobileContainer>
  );
}

export default Home;
