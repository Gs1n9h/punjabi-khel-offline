import { useState } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { PageHeader } from "@/components/ui/page-header";
import { useGetRandomQuiz, useSubmitQuizAnswers } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Link } from "wouter";

export default function KnowledgeTest() {
  const { data: quizData, isLoading } = useGetRandomQuiz({ query: { count: 5 } });
  const submitAnswers = useSubmitQuizAnswers();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number, selectedAnswer: string }[]>([]);
  const [result, setResult] = useState<any>(null);

  const questions = quizData?.questions || [];
  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (option: string) => {
    const newAnswers = [...answers, { questionId: currentQuestion.id, selectedAnswer: option }];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    } else {
      // Submit
      submitAnswers.mutate({ data: { answers: newAnswers } }, {
        onSuccess: (data) => {
          setResult(data);
          if (data.score >= 80) {
            confetti({ particleCount: 150, spread: 80, colors: ['#E8721A', '#1A56E8', '#FFD700'] });
          }
        }
      });
    }
  };

  if (isLoading) {
    return (
      <MobileContainer>
        <PageHeader title="Gyan" showBack />
        <div className="p-4 space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </MobileContainer>
    );
  }

  if (result) {
    return (
      <MobileContainer className="bg-gradient-to-b from-[#FFF8F0] to-orange-50">
        <PageHeader title="Results" showBack backHref="/games" />
        <div className="p-6 flex flex-col items-center justify-center flex-1 text-center space-y-6">
          <div className="bg-white p-8 rounded-[32px] border-4 border-orange-100 shadow-xl w-full">
            <h2 className="text-2xl font-black text-slate-800 mb-2">Quiz Complete!</h2>
            <div className="text-6xl font-black text-primary mb-4">{result.score}%</div>
            <p className="font-bold text-muted-foreground">
              You got {result.correctAnswers} out of {result.totalQuestions} correct
            </p>
            <div className="mt-4 pt-4 border-t-2 border-slate-100">
              <p className="text-sm font-bold uppercase text-slate-400">Points Earned</p>
              <p className="text-3xl font-black text-green-600">+{result.pointsEarned}</p>
            </div>
          </div>
          <Link href="/games" className="w-full">
            <Button className="w-full h-14 rounded-xl text-lg font-bold">Back to Games</Button>
          </Link>
        </div>
      </MobileContainer>
    );
  }

  if (!currentQuestion) {
    return (
      <MobileContainer>
        <PageHeader title="Gyan" showBack />
        <div className="p-4 text-center">No questions found.</div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer className="bg-gradient-to-b from-[#FFF8F0] to-slate-50">
      <PageHeader 
        title="Gyan Test" 
        subtitle={`Question ${currentIndex + 1} of ${questions.length}`} 
        showBack 
      />

      {/* Progress Bar */}
      <div className="h-2 w-full bg-orange-100">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: `${(currentIndex / questions.length) * 100}%` }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-100 mb-6 flex-1">
              {currentQuestion.imageUrl && (
                <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img src={currentQuestion.imageUrl} alt="Question visual" className="w-full h-full object-cover" />
                </div>
              )}
              <h2 className="text-2xl font-black text-slate-800 leading-tight">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => handleSelectOption(option)}
                  className="w-full h-auto py-4 px-6 text-left justify-start items-center rounded-2xl border-2 border-slate-200 hover:border-primary hover:bg-orange-50 text-lg font-bold text-slate-700 whitespace-normal h-auto shadow-sm active:scale-[0.98] transition-all"
                >
                  <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-4 shrink-0 text-slate-400">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </Button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </MobileContainer>
  );
}
