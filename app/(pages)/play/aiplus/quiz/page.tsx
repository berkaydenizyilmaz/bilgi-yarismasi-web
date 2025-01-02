"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import Link from "next/link";

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

export default function AiPlusQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!category) {
        setError("Kategori bulunamadı");
        return;
      }

      try {
        const response = await fetch("/api/ai/custom-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category })
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
  }, [category]);

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
      // Soruları localStorage'a kaydet
      localStorage.setItem('aiQuizQuestions', JSON.stringify(questions));
      
      router.push(
        `/play/ai/result?mode=aiplus&category=${encodeURIComponent(category || "")}&score=${Math.round((correctCount / questions.length) * 100)}&correct=${correctCount}&incorrect=${incorrectCount}`
      );
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
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
            <Link href="/play/aiplus">
              <Button variant="outline" className="bg-white hover:bg-gray-50">
                Geri Dön
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
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <Card className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {category}
          </h1>
          <div className="flex items-center justify-between">
            <span className="text-base md:text-lg text-gray-600">
              Soru {currentQuestionIndex + 1}/{questions.length}
            </span>
            <div className="w-32 md:w-64 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-orange-600 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-6">
            {currentQuestion.question}
          </h2>
          <div className="space-y-3">
            {Object.entries(currentQuestion.options).map(([key, value]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(key)}
                className="w-full p-4 text-left rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
              >
                <span className="font-medium text-orange-600 mr-2">{key}.</span>
                {value}
              </motion.button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
