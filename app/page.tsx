"use client";

import Link from "next/link";
import { Brain, Trophy, Users, ArrowRight, BookOpen, Sparkles, Stars } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/lib/hooks/useCategories";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import { Category } from "@/types/category";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group",
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
          className="mb-6 p-4 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors duration-300"
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
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
        <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
            {/* Hero Section */}
            <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-b from-orange-50 via-white to-orange-50">
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
                        Klasik quizlerden yapay zeka destekli özel sorulara kadar, bilgi evreninde sınırları zorlayın!
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
                {/* Animasyonlu arka plan elementleri */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div 
                        animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{ 
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear" 
                        }}
                        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-100 to-orange-200/50 rounded-full opacity-50 blur-3xl"
                    />
                    <motion.div 
                        animate={{ 
                            rotate: [360, 0],
                            scale: [1, 1.3, 1],
                        }}
                        transition={{ 
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-100 to-orange-200/50 rounded-full opacity-50 blur-3xl"
                    />
                </div>
            </section>

            {/* Özellikler Section */}
            <section className="py-20 px-4 bg-gradient-to-b from-orange-50 via-white to-white relative overflow-hidden">
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
                            className="transform transition-all duration-500 hover:translate-y-[-8px] hover:shadow-2xl"
                        />
                        <FeatureCard
                            icon={<Trophy className="h-12 w-12 text-orange-600" />}
                            title="Rekabet"
                            description="Lider tablosunda yerinizi alın ve diğer QuizVerse üyeleriyle yarışın"
                            className="transform transition-all duration-500 hover:translate-y-[-8px] hover:shadow-2xl"
                        />
                        <FeatureCard
                            icon={<Users className="h-12 w-12 text-orange-600" />}
                            title="Topluluk"
                            description="QuizVerse topluluğuna katılın ve bilgi paylaşımının tadını çıkarın"
                            className="transform transition-all duration-500 hover:translate-y-[-8px] hover:shadow-2xl"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Yapay Zeka Özellikler Section */}
            <section className="py-20 px-4 bg-gradient-to-b from-white via-purple-50/30 to-purple-50 relative overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-6xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                            Yapay Zeka Destekli Quiz Deneyimi
                        </h2>
                    </motion.div>
                    <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
                        QuizVerse'in yenilikçi yapay zeka özellikleriyle öğrenme deneyiminizi kişiselleştirin
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.div 
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="relative z-10"
                            >
                                <div className="mb-6 p-4 bg-purple-50 rounded-xl w-fit group-hover:bg-purple-100 transition-colors duration-300">
                                    <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Sparkles className="h-12 w-12 text-purple-600" />
                                    </motion.div>
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">AI Quiz Modu</h3>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    Yapay zeka tarafından gerçek zamanlı üretilen sorularla bilginizi test edin. Her seferinde benzersiz bir deneyim yaşayın.
                                </p>
                                <Link href="/play/ai">
                                    <Button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                                        Deneyin
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-purple-100 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="relative z-10"
                            >
                                <div className="mb-6 p-4 bg-purple-50 rounded-xl w-fit group-hover:bg-purple-100 transition-colors duration-300">
                                    <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Stars className="h-12 w-12 text-purple-600" />
                                    </motion.div>
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">AI+ Özel Quiz</h3>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    İstediğiniz konu hakkında yapay zeka size özel sorular üretsin. Öğrenme yolculuğunuzu tamamen kişiselleştirin.
                                </p>
                                <Link href="/play/aiplus">
                                    <Button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                                        Keşfedin
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
                
                {/* Animasyonlu dekoratif elementler */}
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180],
                        opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl"
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [180, 0],
                        opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
                />
            </section>

            {/* Kategoriler Section */}
            {categories.length > 0 && (
                <section className="py-20 px-4 bg-gradient-to-b from-purple-50 via-white to-orange-50 relative overflow-hidden">
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
            <section className="py-24 px-4 bg-gradient-to-r from-orange-600 via-orange-500 to-pink-500 text-white relative overflow-hidden">
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
                                <Link href="/auth">
                                    <Button className="w-full sm:w-auto bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl transition-all duration-300 transform hover:scale-105">
                                        Üye Ol
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

function CategoryCard({ icon, title, description }: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <motion.div 
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 group"
        >
            <div className="flex items-start space-x-4">
                <motion.div 
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className="bg-orange-50 p-3 rounded-lg group-hover:bg-orange-100 transition-colors duration-300"
                >
                    {icon}
                </motion.div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
                </div>
            </div>
        </motion.div>
    );
}