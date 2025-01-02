"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Trophy, CheckCircle2, XCircle, Sparkles } from "lucide-react";

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

function QuestionCard({ questionNumber, question }: { questionNumber: number; question: Question }) {
  return (
    <Card className="p-4 md:p-6 mb-4 bg-white/80 backdrop-blur-sm">
      <h3 className="text-base md:text-lg font-semibold mb-2">
        Soru {questionNumber}: {question.question}
      </h3>
      <div className="space-y-2">
        {Object.entries(question.options).map(([key, value]) => {
          const isUserAnswer = question.userAnswer === key;
          const isCorrectAnswer = question.correct_option === key;

          let optionStyle = "bg-white/50";
          if (isUserAnswer && question.isCorrect) {
            optionStyle = "bg-green-100";
          } else if (isUserAnswer && !question.isCorrect) {
            optionStyle = "bg-red-100";
          } else if (isCorrectAnswer && !question.isCorrect) {
            optionStyle = "bg-green-100";
          }

          return (
            <div
              key={key}
              className={`p-3 rounded-lg flex justify-between items-center ${optionStyle}`}
            >
              <span className="text-gray-800">
                {key}. {value}
              </span>
              {isUserAnswer && (
                <span className="ml-2 text-lg">
                  {question.isCorrect ? "✓" : "✗"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function AiResultPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const categoryId = searchParams.get("category");
  const score = Number(searchParams.get("score") || 0);
  const correct = Number(searchParams.get("correct") || 0);
  const incorrect = Number(searchParams.get("incorrect") || 0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    const savedQuestions = localStorage.getItem('aiQuizQuestions');
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }

    const fetchCategoryName = async () => {
      if (categoryId && !isNaN(Number(categoryId))) {
        try {
          const response = await fetch(`/api/categories/${categoryId}`);
          const data = await response.json();
          if (data.success) {
            setCategoryName(data.data.name);
          }
        } catch (error) {
          console.error("Kategori adı alınamadı:", error);
        }
      }
    };

    if (mode === "ai") {
      fetchCategoryName();
    }
  }, [categoryId, mode]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-400 bg-clip-text text-transparent mb-3 sm:mb-4">
            Quiz Tamamlandı!
          </h1>
          {mode === "ai" ? (
            categoryName && (
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mt-2">
                {categoryName}
              </p>
            )
          ) : (
            categoryId && (
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mt-2">
                {decodeURIComponent(categoryId)}
              </p>
            )
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <StatCard
            icon={<Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />}
            title="Başarı Puanı"
            value={`%${score}`}
            className="bg-purple-50"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />}
            title="Doğru Cevap"
            value={correct.toString()}
            className="bg-green-50"
          />
          <StatCard
            icon={<XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />}
            title="Yanlış Cevap"
            value={incorrect.toString()}
            className="bg-red-50"
          />
        </div>

        {/* Soru detayları */}
        <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          {questions.map((question, index) => (
            <QuestionCard
              key={index}
              questionNumber={index + 1}
              question={question}
            />
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <Link href="/play">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 
              text-white font-semibold py-4 sm:py-6 px-6 sm:px-8 rounded-xl text-base sm:text-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Mod Seçimine Dön
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, className = "" }: { icon: any; title: string; value: string; className?: string }) {
  return (
    <Card className={`text-center p-3 sm:p-4 md:p-6 ${className}`}>
      <div className="flex flex-col items-center gap-1 sm:gap-2">
        {icon}
        <p className="text-xs sm:text-sm md:text-base text-gray-600">{title}</p>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </Card>
  );
}