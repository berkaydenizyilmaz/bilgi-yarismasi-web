import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

  const fetchQuestions = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/questions?categoryId=${categoryId}&userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sorular alınamadı');
      }

      const formattedQuestions = data.data.map((q: any) => ({
        id: q.id,
        question_text: q.question_text,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correct_option: q.correct_option,
      }));

      setQuestions(formattedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      router.push('/quiz/categories');
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

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }

    if (currentQuestionIndex === questions.length - 1) {
      await saveQuizResults(updatedQuestions);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const saveQuizResults = async (questionsList: Question[]) => {
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1, // TODO: Gerçek kullanıcı ID'sini al
          categoryId: Number(categoryId),
          totalQuestions: questions.length,
          correctAnswers: correctCount,
          incorrectAnswers: incorrectCount,
          score: calculateScore(correctCount, questions.length),
          questions: questionsList.map(q => ({
            id: q.id,
            isCorrect: q.isCorrect,
            userAnswer: q.userAnswer
          }))
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error);
      }

      router.push(`/quiz/result?quizId=${result.data.id}`);
    } catch (error) {
      setError('Quiz sonuçları kaydedilemedi');
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