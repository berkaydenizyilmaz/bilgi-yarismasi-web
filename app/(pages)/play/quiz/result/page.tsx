"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";

// Temel veri tipleri için interface tanımlamaları
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
        <Card className={`text-center p-4 md:p-6 ${className}`}>
            <p className="text-sm md:text-base text-gray-600">{title}</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-800">{value}</p>
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
        <Card className="p-4 md:p-6 mb-4">
            <h3 className="text-base md:text-lg font-semibold mb-2">
                Soru {questionNumber}: {interaction.question.question_text}
            </h3>
            <div className="space-y-2">
                {Object.entries(options).map(([key, value]) => (
                    <div
                        key={key}
                        className={`p-2 md:p-3 rounded text-sm md:text-base ${
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

// Quiz sonuçlarını görüntülemek için ana bileşen
function QuizResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const quizId = searchParams.get("quizId");
    const [result, setResult] = useState<QuizResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { refreshLeaderboard } = useLeaderboard();

    useEffect(() => {
        // Quiz sonuçlarını API'den getir ve leaderboard'u güncelle
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
                    router.push('/play/classic');
                }, 3000);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResult();
    }, [quizId, router, refreshLeaderboard]);

    // Yükleme durumu kontrolü
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner className="h-6 w-6" /></div>;
    }

    if (error || !result) {
        return (
            <div className="text-center p-4">
                <p className="text-red-500 mb-4">{error || "Sonuç bulunamadı"}</p>
                <Link href="/play/quiz/classic">
                    <Button>Kategorilere Dön</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">
                        {result.category.name} Kategorisi Quiz Sonuçları
                    </h1>
                </div>

                {/* İstatistik kartları */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
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

                {/* Soru-cevap kartları listesi */}
                <div className="space-y-4 md:space-y-6">
                    {result.user_interactions.map((interaction, index) => (
                        <QuestionCard
                            key={index}
                            questionNumber={index + 1}
                            interaction={interaction}
                        />
                    ))}
                </div>

                <div className="text-center mt-6 md:mt-8">
                    <Link href="/play/classic">
                        <Button className="text-sm md:text-base px-6 py-2 md:px-8 md:py-3">
                            Yeni Quiz Başlat
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Sayfa yüklenirken Suspense ile sarmalanmış ana bileşen
export default function QuizResultPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <QuizResultContent />
        </Suspense>
    );
}