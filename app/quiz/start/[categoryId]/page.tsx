"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from "next/navigation";

interface Question {
    id: number;
    question_text: string;
    options: string[];
    correct_option: string; // Doğru cevap
}

export default function QuizPage() {
    const { categoryId: categoryIdParam } = useParams<{ categoryId: string }>();
    const searchParams = useSearchParams();
    const categoryName = searchParams.get("name");
    const router = useRouter();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState<number>(0);
    const [incorrectCount, setIncorrectCount] = useState<number>(0);
    const categoryId = Number(categoryIdParam); // Kategori ID'sini buradan alıyoruz

    useEffect(() => {
        const fetchQuestions = async () => {
            const response = await fetch(`/api/questions?categoryId=${categoryId}`);
            const data = await response.json();
        
            if (response.ok) {
                const formattedQuestions = data.map((question: any) => ({
                    id: question.id,
                    question_text: question.question_text,
                    options: [question.option_a, question.option_b, question.option_c, question.option_d],
                    correct_option: question.correct_option, // Doğru cevap burada harf olarak geliyor (A, B, C, D)
                }));
                setQuestions(formattedQuestions);
            } else {
                console.error("Soruları alırken hata:", data.error);
            }
        };

        fetchQuestions();
    }, [categoryId]);


    const handleAnswer = (selectedOption: string) => {
        const question = questions[currentQuestionIndex];
    
        if (question) {
            const selectedIndex = question.options.findIndex(option => option === selectedOption);
            const isCorrect = question.correct_option.toUpperCase() === String.fromCharCode(65 + selectedIndex);
    
            // Önce cevabı kaydet
            if (isCorrect) {
                setCorrectCount(prev => prev + 1);
                alert("Doğru cevap!");
            } else {
                setIncorrectCount(prev => prev + 1);
                alert("Yanlış cevap!");
            }
    
            // Sonraki soru indeksini hesapla
            const nextIndex = currentQuestionIndex + 1;
            
            if (nextIndex === questions.length) {
                // Son soruya geldiğimizde, state güncellemelerinin tamamlanmasını bekle
                Promise.resolve().then(() => {
                    // State'in güncel değerlerini kullanarak sonuçları kaydet
                    const finalCorrectCount = isCorrect ? correctCount + 1 : correctCount;
                    const finalIncorrectCount = isCorrect ? incorrectCount : incorrectCount + 1;
                    
                    saveQuizResults(finalCorrectCount, finalIncorrectCount);
                });
            }
            
            setCurrentQuestionIndex(nextIndex);
        }
    };
    
    // saveQuizResults fonksiyonunu güncelleyelim
    const saveQuizResults = async (finalCorrectCount: number, finalIncorrectCount: number) => {
        try {
            const userId = 1; // TODO: Gerçek kullanıcı ID'si
            const totalQuestions = questions.length;
            const score = Math.round((finalCorrectCount / totalQuestions) * 100);
    
            console.log("Quiz Sonuçları Gönderiliyor:");
            console.log("Toplam Soru:", totalQuestions);
            console.log("Doğru Cevap:", finalCorrectCount);
            console.log("Yanlış Cevap:", finalIncorrectCount);
            console.log("Skor:", score);
    
            const response = await fetch('/api/quizzes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    categoryId,
                    totalQuestions,
                    correctAnswers: finalCorrectCount,
                    incorrectAnswers: finalIncorrectCount,
                    score,
                }),
            });
    
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Quiz sonuçları kaydedilemedi');
            }
    
            const result = await response.json();
            router.push(`/quiz/result?quizId=${result.id}`);
    
        } catch (error) {
            console.error("Quiz kaydetme hatası:", error);
            alert("Quiz sonuçları kaydedilirken bir hata oluştu!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-4xl font-bold text-orange-600 mb-6">Seçilen Kategori: {categoryName || 'Belirtilmedi'}</h1>
            <div className="w-full max-w-2xl">
                {currentQuestionIndex < questions.length && (
                    <div key={questions[currentQuestionIndex].id} className="border rounded-lg p-6 bg-white shadow-md mb-4">
                        <h2 className="text-xl font-semibold mb-2">{questions[currentQuestionIndex].question_text}</h2>
                        <div className="space-y-2">
                            {questions[currentQuestionIndex].options.map((option) => (
                                <button
                                    key={option}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-left py-2 px-4 rounded"
                                    onClick={() => handleAnswer(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}