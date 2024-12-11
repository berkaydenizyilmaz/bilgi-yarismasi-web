import useSWR from 'swr';

interface UserProfile {
  id: number;
  email: string;
  username: string;
  total_play_count: number;
  total_score: number;
  created_at: string;
}

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: { user: UserProfile };
  }>('/api/auth');

  return {
    profile: data?.data.user,
    isLoading,
    error: error?.message,
    refreshProfile: mutate,
  };
}