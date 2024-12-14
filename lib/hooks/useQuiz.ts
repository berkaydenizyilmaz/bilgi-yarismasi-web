import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Question {
    id: number;
    question_text: string;
    options: string[];
    correct_option: string;
    isCorrect?: boolean;
    userAnswer?: string;
}

export const useQuiz = (categoryId: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const calculateScore = (correct: number, total: number): number => {
    return Math.round((correct / total) * 100);
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const authResponse = await fetch('/api/auth');
        const authData = await authResponse.json();
        
        if (!authResponse.ok || !authData.data.user) {
            throw new Error(authData.error?.message || 'Kullanıcı bilgisi alınamadı');
        }

        const response = await fetch(`/api/questions?categoryId=${categoryId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Sorular alınamadı');
        }

        const formattedQuestions = data.data.map((q: any) => ({
            id: q.id,
            question_text: q.question_text,
            options: [q.option_a, q.option_b, q.option_c, q.option_d],
            correct_option: q.correct_option,
        }));

        const shuffledQuestions = [...formattedQuestions].sort(() => Math.random() - 0.5);
        setQuestions(shuffledQuestions);
        setCurrentQuestionIndex(0);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
};

  const handleAnswer = async (selectedOption: string) => {
    const question = questions[currentQuestionIndex];
    if (!question) return;

    const selectedIndex = question.options.findIndex(opt => opt === selectedOption);
    const userAnswer = String.fromCharCode(65 + selectedIndex);
    const isCorrect = question.correct_option.toUpperCase() === userAnswer;

    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
        ...question,
        isCorrect,
        userAnswer
    };
    setQuestions(updatedQuestions);

    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    const newIncorrectCount = !isCorrect ? incorrectCount + 1 : incorrectCount;

    if (isCorrect) {
        setCorrectCount(newCorrectCount);
    } else {
        setIncorrectCount(newIncorrectCount);
    }

    if (currentQuestionIndex === questions.length - 1) {
        await saveQuizResults(updatedQuestions, newCorrectCount, newIncorrectCount);
    } else {
        setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const saveQuizResults = async (
    questionsList: Question[], 
    finalCorrectCount: number, 
    finalIncorrectCount: number
) => {
    try {
        const response = await fetch("/api/quizzes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                categoryId: Number(categoryId),
                totalQuestions: questions.length,
                correctAnswers: finalCorrectCount,
                incorrectAnswers: finalIncorrectCount,
                score: calculateScore(finalCorrectCount, questions.length),
                questions: questionsList.map(q => ({
                    id: q.id,
                    isCorrect: q.isCorrect,
                    userAnswer: q.userAnswer
                }))
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || 'Quiz sonuçları kaydedilemedi');
        }

        router.push(`/play/quiz/result?quizId=${result.data.data.quizId}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Quiz sonuçları kaydedilemedi';
        setError(errorMessage);
    }
};
  
  return {
    questions,
    currentQuestionIndex,
    correctCount,
    incorrectCount,
    isLoading,
    error,
    fetchQuestions,
    handleAnswer,
  };
}; 