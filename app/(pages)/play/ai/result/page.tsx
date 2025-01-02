"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Sparkles, Trophy, CheckCircle2, XCircle } from "lucide-react";

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

function QuizResultContent() {
  const searchParams = useSearchParams();
  const score = Number(searchParams.get("score") || 0);
  const correctCount = Number(searchParams.get("correct") || 0);
  const incorrectCount = Number(searchParams.get("incorrect") || 0);
  const mode = searchParams.get("mode") || "ai";
  const category = searchParams.get("category");
  
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Component mount olduğunda localStorage'dan soruları al
    const savedQuestions = localStorage.getItem('aiQuizQuestions');
    if (savedQuestions) {
      try {
        setQuestions(JSON.parse(savedQuestions));
        // Soruları aldıktan sonra localStorage'ı temizle
        localStorage.removeItem('aiQuizQuestions');
      } catch (error) {
        console.error('Sorular yüklenirken hata oluştu:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-4">
            Quiz Tamamlandı!
          </h1>
          {category && (
            <p className="text-xl md:text-2xl text-gray-600 mt-2">
              {decodeURIComponent(category)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-4 md:p-6 bg-orange-50">
            <div className="flex flex-col items-center gap-2">
              <Trophy className="w-8 h-8 text-orange-500" />
              <p className="text-sm md:text-base text-gray-600">Başarı Puanı</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">%{score}</p>
            </div>
          </Card>
          <Card className="text-center p-4 md:p-6 bg-green-50">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <p className="text-sm md:text-base text-gray-600">Doğru Cevap</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{correctCount}</p>
            </div>
          </Card>
          <Card className="text-center p-4 md:p-6 bg-red-50">
            <div className="flex flex-col items-center gap-2">
              <XCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm md:text-base text-gray-600">Yanlış Cevap</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{incorrectCount}</p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${
                  question.isCorrect ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {question.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {index + 1}. {question.question}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(question.options).map(([key, value]) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border ${
                          key === question.correct_option
                            ? 'border-green-200 bg-green-50'
                            : key === question.userAnswer && !question.isCorrect
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <span className={`font-medium ${
                          key === question.correct_option
                            ? 'text-green-600'
                            : key === question.userAnswer && !question.isCorrect
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}>
                          {key}.
                        </span>
                        <span className="ml-2">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href={`/play/${mode}`}>
            <Button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-6 px-8 rounded-xl text-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Yeni Quiz Başlat
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function QuizResultPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <QuizResultContent />
    </Suspense>
  );
}