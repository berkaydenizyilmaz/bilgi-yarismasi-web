import useSWR from 'swr';

export type QuizHistory = {
  id: number;
  category: {
    name: string;
  };
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  score: number;
  played_at: string;
};

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