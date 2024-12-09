"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface QuizResult {
    id: number;
    total_questions: number;
    correct_answers: number;
    incorrect_answers: number;
    score: number;
    played_at: string;
    category: {
        name: string;
    };
}

export default function QuizResultPage() {
    const [result, setResult] = useState<QuizResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    
    const searchParams = useSearchParams();
    const quizId = searchParams.get("quizId");

    useEffect(() => {
        const fetchQuizResult = async () => {
            try {
                if (!quizId) {
                    throw new Error("Quiz ID bulunamadı");
                }

                const response = await fetch(`/api/quizzes/${quizId}`);
                if (!response.ok) {
                    throw new Error("Quiz sonuçları alınamadı");
                }

                const data = await response.json();
                setResult(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Bir hata oluştu");
            } finally {
                setLoading(false);
            }
        };

        fetchQuizResult();
    }, [quizId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl text-gray-600">Yükleniyor...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-red-500 mb-4">{error}</div>
                <Link href="/quiz/categories" className="text-blue-500 hover:underline">
                    Kategorilere Dön
                </Link>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-gray-600 mb-4">Sonuç bulunamadı</div>
                <Link href="/quiz/categories" className="text-blue-500 hover:underline">
                    Kategorilere Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="bg-orange-600 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white text-center">
                            Quiz Sonuçları
                        </h1>
                    </div>
                    
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">Toplam Soru</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {result.total_questions}
                                </p>
                            </div>
                            
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">Başarı Oranı</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    %{result.score}
                                </p>
                            </div>
                            
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-green-600">Doğru Cevap</p>
                                <p className="text-3xl font-bold text-green-800">
                                    {result.correct_answers}
                                </p>
                            </div>
                            
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <p className="text-red-600">Yanlış Cevap</p>
                                <p className="text-3xl font-bold text-red-800">
                                    {result.incorrect_answers}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600 mb-6">
                                Tebrikler! Quiz'i tamamladınız.
                            </p>
                            <div className="space-x-4">
                                <Link 
                                    href="/quiz/categories" 
                                    className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition duration-200"
                                >
                                    Yeni Quiz Başlat
                                </Link>
                                <Link 
                                    href="/dashboard/leaderboard" 
                                    className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition duration-200"
                                >
                                    Lider Tablosu
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}