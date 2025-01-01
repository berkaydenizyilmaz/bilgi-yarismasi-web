"use client";

import Link from "next/link";
import { Brain, Trophy, Users, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/lib/hooks/useCategories";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";

interface Category {
    id: number;
    name: string;
    description: string;
}

export default function HomePage() {
    const { categories, isLoading, error } = useCategories();
    const { user } = useAuth();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner className="h-10 w-10" /></div>;
    }

    if (error) {
        return (
            <div className="text-center p-4">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
            {/* Hero Section */}
            <section className="relative py-24 px-4 overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl mx-auto text-center relative z-10"
                >
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 160, delay: 0.2 }}
                        className="flex justify-center mb-8"
                    >
                        <div className="p-4 bg-orange-100 rounded-2xl">
                            <Brain className="h-16 w-16 text-orange-600" />
                        </div>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
                    >
                        QuizVerse'e
                        <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent"> Hoş Geldiniz</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Bilgi evreninde sınırları zorlayın! QuizVerse ile öğrenmeyi eğlenceye dönüştürün.
                    </motion.p>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-center gap-4"
                    >
                        <Link href="/play">
                            <Button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-6 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                                Keşfetmeye Başla
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
                {/* Dekoratif arka plan elementleri */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full opacity-50 blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100 rounded-full opacity-50 blur-3xl" />
                </div>
            </section>

            {/* Özellikler Section */}
            <section className="py-20 px-4 bg-white relative overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-6xl mx-auto"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
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
                </motion.div>
            </section>

            {/* Kategoriler Section */}
            {categories.length > 0 && (
                <section className="py-20 px-4 bg-gradient-to-b from-orange-50 to-white relative overflow-hidden">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="max-w-6xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center">
                            Popüler Kategoriler
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.slice(0, 6).map((category: Category, index: number) => (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <CategoryCard
                                        icon={<BookOpen className="h-8 w-8 text-orange-600" />}
                                        title={category.name}
                                        description={"Bu kategori hakkında daha fazla bilgi yakında eklenecek"}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-24 px-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 opacity-5" />
                </div>
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center relative z-10"
                >
                    {!user ? (
                        <>
                            <Sparkles className="h-12 w-12 mx-auto mb-8 text-white/80" />
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                QuizVerse Topluluğuna Katılın!
                            </h2>
                            <p className="text-xl md:text-2xl mb-12 text-white/90">
                                Hemen üye olun ve bilgi evreninin bir parçası olun.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link href="/auth/register">
                                    <Button className="w-full sm:w-auto bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl transition-all duration-300 transform hover:scale-105">
                                        Üye Ol
                                    </Button>
                                </Link>
                                <Link href="/auth/login">
                                    <Button variant="outline" className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl transition-all duration-300 transform hover:scale-105">
                                        Giriş Yap
                                    </Button>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-12 w-12 mx-auto mb-8 text-white/80" />
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Yeni Bir Maceraya Hazır mısınız?
                            </h2>
                            <p className="text-xl md:text-2xl mb-12 text-white/90">
                                QuizVerse'de keşfedilecek daha çok şey var!
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link href="/play">
                                    <Button className="w-full sm:w-auto bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl transition-all duration-300 transform hover:scale-105">
                                        Quiz'e Başla
                                    </Button>
                                </Link>
                                <Link href="/dashboard/profile">
                                    <Button variant="outline" className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl transition-all duration-300 transform hover:scale-105">
                                        Profilim
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </motion.div>
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
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
        >
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 p-4 bg-orange-50 rounded-xl">
                    {icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
}

function CategoryCard({ icon, title, description }: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
        >
            <div className="flex items-start space-x-4">
                <div className="bg-orange-50 p-3 rounded-lg">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
                </div>
            </div>
        </motion.div>
    );
}