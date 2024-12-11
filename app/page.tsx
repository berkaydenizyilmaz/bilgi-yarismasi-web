"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Brain, Trophy, Users } from "lucide-react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface Category {
    id: number;
    name: string;
    description: string;
}

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch("/api/categories");
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Kategoriler alınamadı.");
                }

                setCategories(result.data || []);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Bir hata oluştu");
            } finally {
                setIsLoading(false);
            }
        }

        fetchCategories();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
            {/* Hero Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Bilgini Test Et, 
                        <span className="text-orange-600"> Kendini Geliştir</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Farklı kategorilerde binlerce soru ile bilgini test et, 
                        arkadaşlarınla yarış ve yeni şeyler öğren!
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/quiz/categories">
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg rounded-xl transition-transform hover:scale-105">
                                Yarışmaya Başla
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Özellikler Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Neden Bilgi Yarışmamıza Katılmalısınız?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain className="h-12 w-12 text-orange-600" />}
                            title="Bilgini Geliştir"
                            description="Her gün yeni sorularla bilgi dağarcığını genişlet"
                        />
                        <FeatureCard
                            icon={<Trophy className="h-12 w-12 text-orange-600" />}
                            title="Ödüller Kazan"
                            description="Yüksek puanlar elde et ve sürpriz ödüller kazanma şansı yakala"
                        />
                        <FeatureCard
                            icon={<Users className="h-12 w-12 text-orange-600" />}
                            title="Arkadaşlarınla Yarış"
                            description="Lider tablosunda yerini al ve arkadaşlarınla rekabet et"
                        />
                    </div>
                </div>
            </section>

            {/* Kategoriler Section */}
            <section className="py-16 px-4 bg-orange-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Quiz Kategorileri
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                icon={<BookOpen className="h-8 w-8 text-orange-600" />}
                                title={category.name}
                                description={category.description || "Bu kategori hakkında daha fazla bilgi yakında eklenecek"}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-orange-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    {!user ? (
                        <>
                            <h2 className="text-4xl font-bold mb-6">
                                Hazır mısın?
                            </h2>
                            <p className="text-xl mb-8 opacity-90">
                                Hemen üye ol ve bilgi yarışmasına başla!
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link href="/auth/register">
                                    <Button className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl">
                                        Üye Ol
                                    </Button>
                                </Link>
                                <Link href="/auth/login">
                                    <Button variant="outline" className="bg-transparent border-white text-white hover:bg-orange-700 px-8 py-6 text-lg rounded-xl">
                                        Giriş Yap
                                    </Button>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-4xl font-bold mb-6">
                                Hoş geldin, {user.username}!
                            </h2>
                            <p className="text-xl mb-8 opacity-90">
                                Yeni bir quiz'e başlamaya hazır mısın?
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link href="/quiz/categories">
                                    <Button className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl">
                                        Quiz'e Başla
                                    </Button>
                                </Link>
                                <Link href="/dashboard/profile">
                                    <Button variant="outline" className="bg-transparent border-white text-white hover:bg-orange-700 px-8 py-6 text-lg rounded-xl">
                                        Profilim
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                    {icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    );
}

function CategoryCard({ icon, title, description }: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm">{description}</p>
                </div>
            </div>
        </div>
    );
}
