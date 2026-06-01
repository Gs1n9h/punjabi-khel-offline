import { Link } from "wouter";
import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Home() {
  return (
    <MobileContainer className="bg-gradient-to-b from-[#FFF8F0] to-orange-100">
      <div className="flex-1 flex flex-col px-6 pt-12 pb-8">
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="mb-8 relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.svg`} alt="Punjabi Khel Logo" className="w-48 h-48 drop-shadow-2xl relative z-10" />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-4 mb-12"
          >
            <h1 className="text-5xl font-black text-primary drop-shadow-sm tracking-tight leading-none">
              Punjabi<br />
              <span className="text-secondary">Khel</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium px-4">
              Learn, play, and celebrate Punjabi culture together!
            </p>
          </motion.div>

          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full space-y-4 mt-auto"
          >
            <Link href="/sign-up">
              <Button size="lg" className="w-full h-16 text-xl rounded-2xl bg-primary hover:bg-[#D4600E] text-white shadow-lg shadow-orange-200 border-b-4 border-[#C25000] active:border-b-0 active:translate-y-1 transition-all">
                Play Now
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="w-full h-16 text-xl rounded-2xl bg-white text-primary border-2 border-orange-200 hover:bg-orange-50 hover:border-primary shadow-sm border-b-4 active:border-b-2 active:translate-y-0.5 transition-all">
                I already have an account
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </MobileContainer>
  );
}

export default Home;
