"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Category {
    id: number;
    name: string;
    description: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch("/api/categories");
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Kategoriler alınamadı.");
                }

                // API yanıtından data özelliğini al
                setCategories(result.data || []);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Bir hata oluştu");
            } finally {
                setIsLoading(false);
            }
        }

        fetchCategories();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    const handleSelectCategory = (category: Category) => {
        setSelectedCategory(category);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-5xl font-bold text-orange-600 mb-6">Yarışma Kategorileri</h1>
            <p className="text-lg text-center text-gray-700 mb-8 max-w-2xl">
                Farklı kategorilerde bilgi yarışmalarına katılmak için aşağıdaki kategorilerden birini seçin. 
                Her kategori, farklı zorluk seviyelerinde sorular sunarak bilgi dağarcığınızı genişletmenize yardımcı olur.
            </p>
            {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 mb-4">
                    {error}
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-4xl">
                {categories.map((category) => (
                    <div 
                        key={category.id} 
                        className="border rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition duration-200 cursor-pointer" 
                        onClick={() => handleSelectCategory(category)}
                    >
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">{category.name}</h3>
                        <p className="text-gray-600">{category.description}</p>
                    </div>
                ))}
            </div>
            {selectedCategory && (
                <div className="text-center mt-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Seçilen Kategori: {selectedCategory.name}</h2>
                    <p className="text-gray-600 mb-4">Bu kategoride yarışmaya başlamak için aşağıdaki butona tıklayın.</p>
                    <Link href={`/quiz/start/${selectedCategory.id}?name=${encodeURIComponent(selectedCategory.name)}`}>
                        <button className="bg-orange-600 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-orange-500 transition duration-200 transform hover:scale-105">
                            Başla
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}