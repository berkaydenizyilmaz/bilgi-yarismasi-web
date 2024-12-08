"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from "next/navigation";

interface Question {
    id: number;
    question_text: string;
    options: string[];
    correct_option: string; // Doğru cevap
}

export default function QuizPage() {
    const { categoryId } = useParams();
    const searchParams = useSearchParams();
    const categoryName = searchParams.get("name");

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        const fetchQuestions = async () => {
            const response = await fetch(`/api/questions?categoryId=${categoryId}`);
            const data = await response.json();

            if (response.ok) {
                const formattedQuestions = data.map((question: any) => ({
                    id: question.id,
                    question_text: question.question_text,
                    options: [question.option_a, question.option_b, question.option_c, question.option_d],
                    correct_option: question.correct_option, // Doğru cevabı burada ayarlıyoruz
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
        if (question && question.correct_option === selectedOption) { // Doğru cevabı kontrol et
            alert("Doğru cevap!");
        } else {
            alert("Yanlış cevap!");
        }
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
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