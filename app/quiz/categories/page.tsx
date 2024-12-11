'use client';

import { useCategories } from '@/lib/hooks/useCategories';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
    const { categories, isLoading, error } = useCategories();
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Quiz Kategorileri
                    </h1>
                    <p className="text-lg text-gray-600">
                        Kendini test etmek istediğin kategoriyi seç ve yarışmaya başla!
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            onStart={() => router.push(`/quiz/start/${category.id}?name=${encodeURIComponent(category.name)}`)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

interface CategoryCardProps {
    category: {
        id: number;
        name: string;
        questionCount: number;
    };
    onStart: () => void;
}

function CategoryCard({ category, onStart }: CategoryCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4 mb-4">
                <div className="bg-orange-50 p-3 rounded-lg">
                    <BookOpen className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-gray-600 text-sm">
                        Bu kategoride {category.questionCount} soru bulunuyor
                    </p>
                </div>
            </div>
            <Button 
                onClick={onStart}
                className="w-full bg-orange-600 hover:bg-orange-700"
            >
                Yarışmaya Başla
            </Button>
        </div>
    );
}