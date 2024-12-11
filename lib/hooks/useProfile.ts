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
    data: UserProfile;
  }>('/api/auth');

  return {
    profile: data?.data,
    isLoading,
    error: error?.message,
    refreshProfile: mutate,
  };
}