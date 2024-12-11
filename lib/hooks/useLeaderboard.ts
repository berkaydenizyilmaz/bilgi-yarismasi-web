import useSWR, { mutate } from 'swr';

interface LeaderboardEntry {
  username: string;
  total_score: number;
  total_play_count: number;
  leaderboard: {
    rank: number;
  };
}

export function useLeaderboard() {
  const { data, error, isLoading } = useSWR<{
    success: boolean;
    data: LeaderboardEntry[];
  }>('/api/leaderboard');

  // Quiz sonrası liderlik tablosunu yenileme fonksiyonu
  const refreshLeaderboard = () => {
    return mutate('/api/leaderboard');
  };

  return {
    leaderboard: Array.isArray(data?.data) ? data.data : [],
    isLoading,
    error: error?.message,
    refreshLeaderboard,
  };
}