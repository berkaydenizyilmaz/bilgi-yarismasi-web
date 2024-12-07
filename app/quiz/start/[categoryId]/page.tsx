"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";

// Soru arayüzü
interface Question {
    id: number;
    question: string;
    options: string[];
    answer: string;
}

const defaultQuestions: Question[] = [
    {
        id: 1,
        question: "Türkiye'nin başkenti neresidir?",
        options: ["İstanbul", "Ankara", "İzmir", "Bursa"],
        answer: "Ankara",
    },
    {
        id: 2,
        question: "Dünya'nın en yüksek dağı hangisidir?",
        options: ["K2", "Everest", "Kilimanjaro", "Aconcagua"],
        answer: "Everest",
    },
    {
        id: 3,
        question: "Hangi gezegen 'Kırmızı Gezegen' olarak bilinir?",
        options: ["Venüs", "Mars", "Jüpiter", "Satürn"],
        answer: "Mars",
    },
];

export default function QuizPage() {
    const { categoryId } = useParams();
    const [questions, setQuestions] = useState<Question[]>([]); // Soruların tipi

    useEffect(() => {
        // Varsayılan soruları ayarla
        setQuestions(defaultQuestions);
    }, []);

    const handleAnswer = (questionId: number, selectedOption: string) => {
        const question = questions.find(q => q.id === questionId);
        if (question && question.answer === selectedOption) {
            alert("Doğru cevap!");
        } else {
            alert("Yanlış cevap!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-4xl font-bold text-orange-600 mb-6">Seçilen Kategori: {typeof categoryId === 'string' ? categoryId : 'Belirtilmedi'}</h1>
            <div className="w-full max-w-2xl">
                {questions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-6 bg-white shadow-md mb-4">
                        <h2 className="text-xl font-semibold mb-2">{question.question}</h2>
                        <div className="space-y-2">
                            {question.options.map((option) => (
                                <button
                                    key={option}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-left py-2 px-4 rounded"
                                    onClick={() => handleAnswer(question.id, option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}