"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";

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

interface StatCardProps {
    title: string;
    value: number | string;
    className?: string;
}

function StatCard({ title, value, className = "" }: StatCardProps) {
    return (
        <Card className={`text-center p-4 ${className}`}>
            <p className="text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </Card>
    );
}

interface QuestionCardProps {
    questionNumber: number;
    interaction: UserInteraction;
}

function QuestionCard({ questionNumber, interaction }: QuestionCardProps) {
    const options = {
        A: interaction.question.option_a,
        B: interaction.question.option_b,
        C: interaction.question.option_c,
        D: interaction.question.option_d,
    };

    return (
        <Card className="p-4">
            <h3 className="font-semibold mb-2">
                Soru {questionNumber}: {interaction.question.question_text}
            </h3>
            <div className="space-y-2">
                {Object.entries(options).map(([key, value]) => (
                    <div
                        key={key}
                        className={`p-2 rounded ${
                            interaction.user_answer === key
                                ? interaction.is_correct
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                : interaction.question.correct_option === key
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-50"
                        }`}
                    >
                        {key}. {value}
                        {interaction.user_answer === key && (
                            <span className="ml-2 font-medium">
                                {interaction.is_correct ? "✓" : "✗"}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
}

export default function QuizResultPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const quizId = searchParams.get("quizId");
    const [result, setResult] = useState<QuizResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { refreshLeaderboard } = useLeaderboard();

    useEffect(() => {
        const fetchResult = async () => {
            try {
                if (!quizId) {
                    throw new Error("Quiz ID bulunamadı");
                }

                const response = await fetch(`/api/quizzes/${quizId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error.message || "Sonuçlar alınamadı");
                }

                setResult(data.data);
                await refreshLeaderboard();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Sonuçlar alınamadı");
                setTimeout(() => {
                    router.push('/quiz/categories');
                }, 3000);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResult();
    }, [quizId, router, refreshLeaderboard]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="text-center p-4">
                <p className="text-red-500 mb-4">{error || "Sonuç bulunamadı"}</p>
                <Link href="/quiz/categories">
                    <Button>Kategorilere Dön</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">
                {result.category.name} Quiz Sonuçları
              </h1>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="text-gray-600"
              >
                Geri Dön
              </Button>
            </div>
      
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Toplam Soru"
                value={result.total_questions}
                className="bg-gray-50"
              />
              <StatCard
                title="Başarı Oranı"
                value={`%${result.score}`}
                className="bg-gray-50"
              />
              <StatCard
                title="Doğru Cevap"
                value={result.correct_answers}
                className="bg-green-50 text-green-700"
              />
              <StatCard
                title="Yanlış Cevap"
                value={result.incorrect_answers}
                className="bg-red-50 text-red-700"
              />
            </div>
      
            <div className="space-y-6">
              {result.user_interactions.map((interaction, index) => (
                <QuestionCard
                  key={index}
                  questionNumber={index + 1}
                  interaction={interaction}
                />
              ))}
            </div>
      
            <div className="text-center mt-8 space-x-4">
              <Button variant="outline" onClick={() => router.back()}>
                Geri Dön
              </Button>
              <Link href="/quiz/categories">
                <Button>Yeni Quiz Başlat</Button>
              </Link>
            </div>
          </div>
        </div>
      );
}