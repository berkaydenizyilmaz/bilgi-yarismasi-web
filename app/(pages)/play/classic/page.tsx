'use client';

import { useCategories } from '@/lib/hooks/useCategories';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ClassicModePage() {
    const { categories, isLoading, error } = useCategories();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner className="h-6 w-6" /></div>;
    }

    if (error) {
        return (
            <div className="text-center p-4">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-orange-600 mb-4">Klasik Mod</h1>
                    <p className="text-3xl text-gray-800 mb-4">Quiz çözmeye başlamak için bir kategori seçin.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(categories) && categories.length > 0 ? (
                        categories.map((category) => (
                            <div key={category.id} className="flex justify-center">
                                <Button 
                                    onClick={() => setSelectedCategory(category.id)} 
                                    className={`relative w-full h-40 flex flex-col items-center justify-center text-lg font-semibold rounded-lg transition-all duration-300 
                                        ${selectedCategory === category.id ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-orange-600 border border-orange-600 hover:bg-orange-50'}`}
                                >
                                    <BookOpen />
                                    <span className="text-center">{category.name}</span> 
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-600">Hiç kategori bulunamadı.</p>
                    )}
                </div>
                {selectedCategory && (
                    <div className="text-center mt-8">
                        <Button 
                            onClick={() => router.push(`/play/quiz/start/${selectedCategory}?name=${encodeURIComponent(categories.find((cat: { id: number; name: string }) => cat.id === selectedCategory)?.name || '')}`)}
                            className="bg-orange-600 hover:bg-orange-700 transition-colors text-white font-bold py-6 px-8 rounded-lg shadow-lg"
                        >
                            Yarışmaya Başla
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}