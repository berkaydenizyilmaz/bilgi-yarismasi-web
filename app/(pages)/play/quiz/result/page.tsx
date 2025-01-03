"use client";

import { Suspense, useEffect, useState, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { Trophy, CheckCircle2, XCircle, Home, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Tip tanımlamaları
interface Question {
    question_text: string;
    correct_option: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
}

interface UserInteraction {
    question: Question;
    user_answer: string;
    is_correct: boolean;
}

interface QuizResult {
    id: number;
    score: number;
    total_questions: number;
    correct_answers: number;
    incorrect_answers: number;
    category: {
        name: string;
    };
    user_interactions: UserInteraction[];
}

// StatCard bileşeni için prop tipleri
interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    className?: string;
    delay?: number;
}

// İstatistik kartı bileşeni
const StatCard = memo<StatCardProps>(({ icon, title, value, className = "", delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className={`text-center p-3 sm:p-4 md:p-6 ${className}`}>
        <div className="flex flex-col items-center gap-1 sm:gap-2">
          {icon}
          <p className="text-xs sm:text-sm md:text-base text-gray-600">{title}</p>
          <motion.p 
            className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.2, duration: 0.3 }}
          >
            {value}
          </motion.p>
        </div>
      </Card>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

// Soru kartı için prop tipleri
interface QuestionCardProps {
    questionNumber: number;
    interaction: UserInteraction;
}

// Soru kartı bileşeni
const QuestionCard = memo<QuestionCardProps>(({ questionNumber, interaction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Seçenekleri bir obje olarak tanımlama
  const options: Record<string, string> = {
    A: interaction.question.option_a,
    B: interaction.question.option_b,
    C: interaction.question.option_c,
    D: interaction.question.option_d,
  };

  // Stil hesaplamaları için yardımcı fonksiyon
  const getOptionStyles = (key: string) => {
    const isUserAnswer = interaction.user_answer.toUpperCase() === key;
    const isCorrectAnswer = interaction.question.correct_option.toUpperCase() === key;

    if (isUserAnswer && interaction.is_correct) {
      return {
        option: "bg-green-100 border border-green-200",
        text: "text-green-700",
        key: "bg-green-500 text-white"
      };
    }
    if (isUserAnswer && !interaction.is_correct) {
      return {
        option: "bg-red-100 border border-red-200",
        text: "text-red-700",
        key: "bg-red-500 text-white"
      };
    }
    if (isCorrectAnswer && !interaction.is_correct) {
      return {
        option: "bg-green-100 border border-green-200",
        text: "text-green-700",
        key: "bg-green-500 text-white"
      };
    }
    return {
      option: "bg-white/50 border border-gray-100",
      text: "text-gray-600",
      key: "bg-gray-100 text-gray-600"
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: questionNumber * 0.1 }}
    >
      <Card 
        className={`p-4 md:p-6 mb-4 bg-white/80 backdrop-blur-sm transition-all duration-300 cursor-pointer
          hover:shadow-md ${isExpanded ? 'ring-2 ring-orange-400' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <h3 className="text-base md:text-lg font-semibold mb-2 flex-1 pr-4">
            <span className="text-orange-600 mr-2">#{questionNumber}</span>
            {interaction.question.question_text}
          </h3>
          <span className={`text-2xl ${interaction.is_correct ? 'text-green-500' : 'text-red-500'}`}>
            {interaction.is_correct ? '✓' : '✗'}
          </span>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 mt-4"
            >
              {Object.entries(options).map(([key, value]) => {
                const { option, text, key: keyStyle } = getOptionStyles(key);

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-lg flex justify-between items-center ${option}`}
                  >
                    <span className={`flex items-center gap-2 ${text}`}>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md 
                        font-medium ${keyStyle}`}>
                        {key}
                      </span>
                      {value}
                    </span>
                    {(interaction.user_answer.toUpperCase() === key || interaction.question.correct_option.toUpperCase() === key) && (
                      <span className="ml-2">
                        {interaction.question.correct_option.toUpperCase() === key && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {interaction.user_answer.toUpperCase() === key && !interaction.is_correct && <XCircle className="w-5 h-5 text-red-500" />}
                      </span>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
});

QuestionCard.displayName = 'QuestionCard';

// Quiz sonuçları için yardımcı fonksiyonlar
const getScoreDetails = (score: number) => ({
  message: score >= 90 ? "Mükemmel!" : 
           score >= 70 ? "Çok İyi!" :
           score >= 50 ? "İyi!" : "Geliştirebilirsin!",
  color: score >= 90 ? "text-orange-600" :
         score >= 70 ? "text-green-600" :
         score >= 50 ? "text-blue-600" : "text-red-600"
});

// Ana içerik bileşeni
function QuizResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const quizId = searchParams.get("quizId");
    const [result, setResult] = useState<QuizResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { refreshLeaderboard } = useLeaderboard();

    // Quiz sonuçlarını getirme
    useEffect(() => {
        const fetchResult = async () => {
            if (!quizId) {
                setError("Quiz ID bulunamadı");
                setTimeout(() => router.push('/play/classic'), 3000);
                return;
            }

            try {
                const response = await fetch(`/api/quizzes/${quizId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error.message || "Sonuçlar alınamadı");
                }

                setResult(data.data);
                refreshLeaderboard();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Sonuçlar alınamadı";
                setError(errorMessage);
                setTimeout(() => router.push('/play/classic'), 3000);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResult();
    }, [quizId, router]);

    // Yükleme ve hata durumları kontrolü
    if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner className="h-6 w-6" /></div>;
    if (error || !result) {
        return (
            <div className="text-center p-4">
                <p className="text-red-500 mb-4">{error || "Sonuç bulunamadı"}</p>
                <Link href="/play/classic">
                    <Button>Kategorilere Dön</Button>
                </Link>
            </div>
        );
    }

    const { message: scoreMessage, color: scoreColor } = getScoreDetails(result.score);

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    className="text-center mb-8 sm:mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-400 
                        bg-clip-text text-transparent mb-3 sm:mb-4">
                        {scoreMessage}
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mt-2">
                        {result.category.name}
                    </p>
                    <motion.p 
                        className={`text-4xl sm:text-5xl md:text-6xl font-bold mt-4 ${scoreColor}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                    >
                        %{result.score}
                    </motion.p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                    <StatCard
                        icon={<Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />}
                        title="Başarı Puanı"
                        value={`%${result.score}`}
                        className="bg-orange-50"
                        delay={0.4}
                    />
                    <StatCard
                        icon={<CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />}
                        title="Doğru Cevap"
                        value={result.correct_answers}
                        className="bg-green-50"
                        delay={0.5}
                    />
                    <StatCard
                        icon={<XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />}
                        title="Yanlış Cevap"
                        value={result.incorrect_answers}
                        className="bg-red-50"
                        delay={0.6}
                    />
                </div>

                <div className="space-y-4 md:space-y-6 mb-8 sm:mb-12">
                    {result.user_interactions.map((interaction, index) => (
                        <QuestionCard
                            key={index}
                            questionNumber={index + 1}
                            interaction={interaction}
                        />
                    ))}
                </div>

                <motion.div 
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 sm:mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Link href="/play">
                        <Button className="bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 
                            text-white font-semibold py-4 px-6 rounded-xl text-base flex items-center gap-2 w-full sm:w-auto">
                            <Home className="w-5 h-5" />
                            Ana Sayfaya Dön
                        </Button>
                    </Link>
                    <Link href="/play/classic">
                        <Button variant="outline" className="font-semibold py-4 px-6 rounded-xl text-base 
                            flex items-center gap-2 w-full sm:w-auto">
                            <RotateCcw className="w-5 h-5" />
                            Tekrar Dene
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}

// Sayfa bileşeni
export default function QuizResultPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <QuizResultContent />
        </Suspense>
    );
}