import useSWR from 'swr';

interface QuizHistory {
  id: number;
  category: {
    name: string;
  };
  score: number;
  correct_answers: number;
  total_questions: number;
  played_at: string;
}

export function useQuizHistory() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: QuizHistory[];
  }>('/api/users/history');

  return {
    quizHistory: data?.data ?? [],
    isLoading,
    error: error?.message,
    refreshHistory: mutate,
  };
}

export type { QuizHistory };