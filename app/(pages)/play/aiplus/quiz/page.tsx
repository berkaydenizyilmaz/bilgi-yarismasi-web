"use client";

import { Suspense, useCallback, useMemo } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AiLoading } from "@/components/ui/ai-loading";
import { Stars } from "@/components/ui/stars";
import { AlertCircle } from "lucide-react";

interface Question {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitting, setIsAnswerSubmitting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    if (!category) {
      setError("Kategori bulunamadı");
      return;
    }

    try {
      const response = await fetch("/api/ai/custom-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
        cache: 'no-store'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Sorular alınamadı");
      }

      const data = await response.json();
      setQuestions(data.data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sorular alınamadı");
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const handleAnswer = useCallback(async (selectedOption: string) => {
    if (isAnswerSubmitting) return;
    
    setIsAnswerSubmitting(true);
    setSelectedOption(selectedOption);

    const isCorrect = selectedOption === currentQuestion.correct_option;

    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: selectedOption,
      isCorrect
    };
    setQuestions(updatedQuestions);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (currentQuestionIndex === questions.length - 1) {
      const finalResults = updatedQuestions.reduce((acc, q) => {
        if (q.isCorrect) {
          acc.correct++;
        } else {
          acc.incorrect++;
        }
        return acc;
      }, { correct: 0, incorrect: 0 });

      localStorage.setItem('aiQuizQuestions', JSON.stringify(updatedQuestions));
      
      router.push(
        `/play/ai/result?mode=aiplus&category=${encodeURIComponent(category || "")}&score=${Math.round((finalResults.correct / questions.length) * 100)}&correct=${finalResults.correct}&incorrect=${finalResults.incorrect}`
      );
    } else {
      if (isCorrect) {
        setCorrectCount(prev => prev + 1);
      } else {
        setIncorrectCount(prev => prev + 1);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    }
    
    setIsAnswerSubmitting(false);
  }, [currentQuestionIndex, questions, isAnswerSubmitting, category, router]);

  const renderOptions = useMemo(() => {
    if (!currentQuestion) return null;

    return Object.entries(currentQuestion.options).map(([key, value]) => {
      const isSelected = selectedOption === key;
      
      return (
        <motion.button
          key={key}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleAnswer(key)}
          disabled={isAnswerSubmitting}
          className={`group w-full p-3 sm:p-4 text-left rounded-xl border-2 
            ${isSelected 
              ? 'border-purple-500 bg-purple-50/80' 
              : 'border-gray-100 hover:border-purple-300 hover:bg-purple-50/50'
            } 
            transition-all duration-200 relative overflow-hidden
            ${isAnswerSubmitting ? 'cursor-not-allowed opacity-75' : ''}
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 
            opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
          />
          
          <div className="relative flex items-center gap-2 sm:gap-3">
            <span className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg 
              ${isSelected 
                ? 'bg-purple-500 text-white' 
                : 'bg-purple-100 text-purple-600'
              } 
              text-sm sm:text-base font-semibold group-hover:bg-purple-200 
              transition-colors duration-200`}
            >
              {key}
            </span>
            <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 
              transition-colors duration-200"
            >
              {value}
            </span>
          </div>
        </motion.button>
      );
    });
  }, [currentQuestion, selectedOption, isAnswerSubmitting, handleAnswer]);

  if (isLoading) {
    return <AiLoading />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-red-50 border-red-200 p-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <h2 className="text-xl font-semibold text-red-700">
                Hata Oluştu
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Link href="/play/aiplus">
                <Button variant="outline" className="bg-white hover:bg-gray-50">
                  Geri Dön
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-purple-600 to-pink-500 text-white p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-medium opacity-90">
                Yapay Zeka+ Modu
              </h2>
              <p className="text-xs sm:text-sm md:text-base opacity-75">
                {category}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Stars />
              <span className="text-base sm:text-lg font-semibold">
                {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
          </div>
        </Card>

        <Card className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
          <div className="h-1.5 sm:h-2 bg-gray-100 rounded-t-lg overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-6 sm:mb-8"
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </motion.div>
            </AnimatePresence>

            <div className="space-y-3 sm:space-y-4">
              {renderOptions}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AiPlusQuizPage() {
  return (
    <Suspense fallback={<AiLoading />}>
      <QuizContent />
    </Suspense>
  );
}