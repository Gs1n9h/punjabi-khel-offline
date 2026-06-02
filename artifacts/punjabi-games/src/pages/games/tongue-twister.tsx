import { useState, useRef, useEffect } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { useListTongueTwisters, useSubmitTongueTwisterRecording } from "@/lib/offline-api";
import { Button } from "@/components/ui/button";
import { Mic, Square, UploadCloud } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function TongueTwisterGame() {
  const { data: twisters, isLoading } = useListTongueTwisters();
  const submitRecording = useSubmitTongueTwisterRecording();
  const { toast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const activeTwister = twisters?.filter(t => t.isActive)?.[currentIndex];

  const handleNext = () => {
    if (twisters && currentIndex < twisters.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetState();
    }
  };

  const resetState = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setIsRecording(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
      };

      // Flash effect before starting
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 600);

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast({ title: "ਮਾਈਕ੍ਰੋਫ਼ੋਨ ਪਹੁੰਚ ਨਾਮੰਜ਼ੂਰ", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob || !activeTwister) return;

    setIsUploading(true);
    try {
      await submitRecording.mutateAsync({
        id: activeTwister.id,
        data: { audioUrl: audioUrl || "", durationSeconds: 0 }
      });

      toast({ title: "ਸਥਾਨਕ ਤੌਰ 'ਤੇ ਸੰਭਾਲਿਆ! ਵਧੀਆ ਅਭਿਆਸ।" });
      handleNext();
    } catch (err) {
      toast({ title: "ਰਿਕਾਰਡਿੰਗ ਸੰਭਾਲ ਨਹੀਂ ਸਕੀ", variant: "destructive" });
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

  if (!activeTwister) {
    return (
      <MobileContainer>
        <PageHeader title="ਬੋਲੀ" showBack />
        <div className="p-4 flex flex-col items-center justify-center h-64 text-center">
          <p className="font-bold text-muted-foreground text-xl">ਤੁਸੀਂ ਸਾਰੀਆਂ ਜ਼ੁਬਾਨ ਚੁਸਤੀਆਂ ਕੀਤੀਆਂ!</p>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer className="bg-gradient-to-b from-[#FFF8F0] to-orange-50">
      <PageHeader title="ਬੋਲੀ" subtitle="ਜ਼ੁਬਾਨ ਚੁਸਤੀਆਂ" showBack />

      <div className="flex-1 flex flex-col p-6">
        <motion.div 
          animate={isFlashing ? { scale: [1, 1.05, 1], opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 0.2, repeat: 2 }}
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

        <div className="mt-8 space-y-6">
          {!audioUrl ? (
            <div className="flex flex-col items-center">
              <Button
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full shadow-xl transition-all ${
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600 animate-pulse border-4 border-red-200" 
                    : "bg-primary hover:bg-[#D4600E] border-4 border-orange-200"
                }`}
              >
                {isRecording ? <Square className="w-10 h-10 text-white fill-white" /> : <Mic className="w-12 h-12 text-white" />}
              </Button>
              <p className="mt-4 font-bold text-muted-foreground uppercase tracking-widest text-sm">
                {isRecording ? "ਰਿਕਾਰਡਿੰਗ…" : "ਰਿਕਾਰਡ ਕਰਨ ਲਈ ਛੂਹੋ"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 bg-white p-4 rounded-2xl border-2 border-orange-100">
              <audio src={audioUrl} controls className="w-full" />
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={resetState}
                  className="rounded-xl border-2 hover:bg-orange-50"
                  disabled={isUploading}
                >
                  ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="rounded-xl bg-primary text-white shadow-md"
                  disabled={isUploading}
                >
                  {isUploading ? "ਜਮ੍ਹਾਂ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ…" : (
                    <>
                      <UploadCloud className="w-4 h-4 mr-2" />
                      ਜਮ੍ਹਾਂ ਕਰੋ
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
