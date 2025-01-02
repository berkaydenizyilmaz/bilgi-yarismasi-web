"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import Link from "next/link";
import { AiLoading } from "@/components/ui/ai-loading"
import { Sparkles } from "lucide-react";

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

export default function AiQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!categoryId) {
        setError("Kategori ID'si bulunamadı");
        return;
      }

      try {
        const response = await fetch("/api/ai/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: categoryId })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "Sorular alınamadı");
        }

        setQuestions(data.data.questions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sorular alınamadı");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [categoryId]);

  const handleAnswer = (selectedOption: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correct_option;

    // Soruyu güncelle
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: selectedOption,
      isCorrect
    };
    setQuestions(updatedQuestions);

    // Doğru/yanlış sayısını güncelle
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }

    // Son soru ise sonuç sayfasına yönlendir
    if (currentQuestionIndex === questions.length - 1) {
      localStorage.setItem('aiQuizQuestions', JSON.stringify(updatedQuestions));
      
      router.push(
        `/play/ai/result?mode=ai&category=${categoryId}&score=${Math.round((correctCount / questions.length) * 100)}&correct=${correctCount}&incorrect=${incorrectCount}`
      );
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  if (isLoading) {
    return <AiLoading />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-red-700 mb-4">
              Hata Oluştu
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Link href="/play/ai">
              <Button variant="outline" className="bg-white hover:bg-gray-50">
                Kategorilere Geri Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-purple-600 to-pink-500 text-white p-4 md:p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-medium opacity-90">Yapay Zeka Modu</h2>
              <p className="text-sm md:text-base opacity-75">Yapay zeka tarafından üretilen sorular</p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 opacity-75" />
              <span className="text-lg font-semibold">
                {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
          </div>
        </Card>

        <Card className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
          <div className="h-2 bg-gray-100 rounded-t-lg overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-4">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(key)}
                  className="group w-full p-4 text-left rounded-xl border-2 border-gray-100 
                    hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200
                    relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  
                  <div className="relative flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg 
                      bg-purple-100 text-purple-600 font-semibold group-hover:bg-purple-200 
                      transition-colors duration-200">
                      {key}
                    </span>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      {value}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
