"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from "next/navigation";

interface Question {
    id: number;
    question_text: string;
    options: string[];
    correct_option: string;
    isCorrect?: boolean;
    userAnswer?: string;
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
    const categoryId = Number(categoryIdParam);

    useEffect(() => {
        const fetchQuestions = async () => {
            const userId = 1; // TODO: Gerçek kullanıcı ID'sini al
            const response = await fetch(`/api/questions?categoryId=${categoryId}&userId=${userId}`);
            const data = await response.json();
        
            if (response.ok) {
                const formattedQuestions = data.map((question: any) => ({
                    id: question.id,
                    question_text: question.question_text,
                    options: [question.option_a, question.option_b, question.option_c, question.option_d],
                    correct_option: question.correct_option,
                }));
                setQuestions(formattedQuestions);
            } else {
                if (response.status === 404) {
                    const message = data.remainingQuestions > 0 
                        ? `Bu kategoride sadece ${data.remainingQuestions} adet cevaplanmamış soru kaldı. Quiz başlatmak için en az 10 soru gereklidir.`
                        : "Bu kategorideki tüm soruları cevapladınız!";
                        
                    alert(message);
                    router.push("/quiz/categories");
                } else {
                    console.error("Soruları alırken hata:", data.error);
                    alert("Sorular alınırken bir hata oluştu!");
                    router.push("/quiz/categories");
                }
            }
        };
    
        fetchQuestions();
    }, [categoryId, router]);

    const handleAnswer = async (selectedOption: string) => {
        const question = questions[currentQuestionIndex];
    
        if (!question) return;
    
        const selectedIndex = question.options.findIndex(option => option === selectedOption);
        const userAnswer = String.fromCharCode(65 + selectedIndex);
        const isCorrect = question.correct_option.toUpperCase() === userAnswer;
    
        // Soru nesnesini güncelle
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex] = {
            ...question,
            isCorrect,
            userAnswer
        };
        setQuestions(updatedQuestions);
    
        // Doğru/yanlış sayısını güncelle
        if (isCorrect) {
            setCorrectCount(prev => prev + 1);
        } else {
            setIncorrectCount(prev => prev + 1);
        }
    
        // Son soru kontrolü
        if (currentQuestionIndex === questions.length - 1) {
            // Son sorunun sonuçlarını da dahil ederek kaydet
            const finalCorrectCount = isCorrect ? correctCount + 1 : correctCount;
            const finalIncorrectCount = isCorrect ? incorrectCount : incorrectCount + 1;
    
            try {
                await saveQuizResults(
                    finalCorrectCount,
                    finalIncorrectCount,
                    updatedQuestions // Güncellenmiş soru listesini gönder
                );
            } catch (error) {
                console.error("Quiz sonuçları kaydedilirken hata:", error);
            }
        } else {
            // Sonraki soruya geç
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const calculateScore = (correctCount: number, totalQuestions: number): number => {
        return Math.round((correctCount / totalQuestions) * 100);
    };
    
    // saveQuizResults fonksiyonunu da güncelleyelim
    const saveQuizResults = async (correctCount: number, incorrectCount: number, questionsList: Question[]) => {
        try {
            const response = await fetch("/api/quizzes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: 1,
                    categoryId: Number(categoryId),
                    totalQuestions: questions.length,
                    correctAnswers: correctCount,
                    incorrectAnswers: incorrectCount,
                    score: calculateScore(correctCount, questions.length),
                    questions: questionsList // Tüm soru listesini gönder
                }),
            });
    
            if (!response.ok) {
                throw new Error("Quiz sonuçları kaydedilemedi");
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
            <h1 className="text-4xl font-bold text-orange-600 mb-6">
                Seçilen Kategori: {categoryName || 'Belirtilmedi'}
            </h1>
            <div className="w-full max-w-2xl">
                {currentQuestionIndex < questions.length && (
                    <div key={questions[currentQuestionIndex].id} 
                         className="border rounded-lg p-6 bg-white shadow-md mb-4">
                        <h2 className="text-xl font-semibold mb-2">
                            {questions[currentQuestionIndex].question_text}
                        </h2>
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