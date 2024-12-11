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
  }>('/api/leaderboard', {
    refreshInterval: 60000, // Her 60 saniyede bir güncelle
  });

  // Quiz sonrası liderlik tablosunu yenileme fonksiyonu
  const refreshLeaderboard = () => {
    return mutate('/api/leaderboard');
  };

  return {
    leaderboard: data?.data ?? [],
    isLoading,
    error: error?.message,
    refreshLeaderboard,
  };
}