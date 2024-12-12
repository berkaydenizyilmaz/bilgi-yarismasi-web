import useSWR from 'swr';
import { fetcher } from '../swr-config';

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
  const { data, error, isLoading } = useSWR('/api/categories', fetcher);
  return {
    categories: data?.data?.data || [],
    isLoading,
    error,
  };
} 