import useSWR from 'swr';

export interface Category {
  id: number;
  name: string;
  questionCount: number;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<CategoriesResponse>('/api/categories');

  return {
    categories: data?.data ?? [],
    isLoading,
    error: error?.message,
    mutate, // Veriyi manuel yenileme fonksiyonu
  };
} 