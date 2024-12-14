"use client";

import Link from "next/link";
import { Brain, Trophy, Users } from "lucide-react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/lib/hooks/useCategories";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Category {
    id: number;
    name: string;
    description: string;
}

export default function HomePage() {
    

    

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
            {/* Hero Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="flex justify-center mb-6">
                        <Brain className="h-16 w-16 text-orange-600" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        QuizVerse'e
                        <span className="text-orange-600"> Hoş Geldiniz</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Bilgi evreninde sınırları zorlayın! QuizVerse ile öğrenmeyi eğlenceye dönüştürün.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/play">
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg rounded-xl transition-transform hover:scale-105">
                                Keşfetmeye Başla
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
                        QuizVerse'de Sizi Neler Bekliyor?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain className="h-12 w-12 text-orange-600" />}
                            title="Sınırsız Bilgi"
                            description="Farklı kategorilerde binlerce soru ile bilgi dağarcığınızı genişletin"
                        />
                        <FeatureCard
                            icon={<Trophy className="h-12 w-12 text-orange-600" />}
                            title="Rekabet"
                            description="Lider tablosunda yerinizi alın ve diğer QuizVerse üyeleriyle yarışın"
                        />
                        <FeatureCard
                            icon={<Users className="h-12 w-12 text-orange-600" />}
                            title="Topluluk"
                            description="QuizVerse topluluğuna katılın ve bilgi paylaşımının tadını çıkarın"
                        />
                    </div>
                </div>
            </section>

            {/* Kategoriler Section */}
            

            {/* CTA Section */}
            <section className="py-20 px-4 bg-orange-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    
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
