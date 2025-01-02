"use client";

import { useEffect, useState, useMemo, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Sparkles, Stars, Brain, Zap } from "lucide-react"
import Link from "next/link"
import { memo } from "react"

interface Category {
  id: number
  name: string
  description: string | null
}

const ErrorComponent = memo(function ErrorComponent({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h2 className="text-xl font-semibold text-red-700">Hata Oluştu</h2>
            <p className="text-red-600">{error}</p>
            <Link href="/play">
              <button className="text-gray-600 hover:text-purple-600 transition-colors">
                Ana Sayfaya Dön
              </button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
});

ErrorComponent.displayName = "ErrorComponent";

export default function AiPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories", {
        cache: 'force-cache'
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Kategoriler alınamadı");
      }

      const categoriesData = Array.isArray(result.data.data) ? result.data.data : [];
      
      if (categoriesData.length === 0) {
        throw new Error("Kategori bulunamadı");
      }

      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kategoriler alınamadı");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const renderCategoryCards = useMemo(() => {
    return categories.map((category, index) => (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => router.push(`/play/ai/quiz?categoryId=${category.id}`)}
        className="group cursor-pointer"
      >
        <Card className="relative h-32 sm:h-40 overflow-hidden transition-all duration-300 
          hover:shadow-lg border-2 border-purple-100 hover:border-purple-200
          bg-gradient-to-br from-white to-purple-50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-500/5 
            opacity-50 group-hover:opacity-100 transition-opacity duration-300" 
          />
          
          <div className="relative h-full p-4 flex flex-col items-center justify-center">
            <div className="mb-3 p-2 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 
              group-hover:from-purple-200 group-hover:to-pink-200 transition-colors duration-300">
              {index % 2 === 0 ? (
                <Sparkles className="w-5 h-5 text-purple-500" />
              ) : (
                <Stars className="w-5 h-5 text-purple-500" />
              )}
            </div>

            <h2 className="text-base sm:text-lg font-medium text-center text-gray-800 
              group-hover:text-purple-600 transition-colors duration-300">
              {category.name}
            </h2>
            
            {category.description && (
              <p className="mt-1 text-xs text-gray-500 text-center line-clamp-2">
                {category.description}
              </p>
            )}

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 
              transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" 
            />
          </div>
        </Card>
      </motion.div>
    ));
  }, [categories, router]);

  if (error) return <ErrorComponent error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-2 bg-purple-100 rounded-full mb-4">
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-400 bg-clip-text text-transparent">
            Yapay Zeka Modu
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Yapay zeka tarafından özenle hazırlanan sorularla bilginizi test edin. 
            Her seferinde yeni ve özgün sorularla karşılaşacaksınız.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-white border-purple-100">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-purple-900">Özgün Sorular</h3>
                <p className="text-sm text-purple-700">Her quiz benzersiz sorularla oluşturulur</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-pink-50 to-white border-pink-100">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-pink-100">
                <Brain className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-medium text-pink-900">Yapay Zeka Destekli</h3>
                <p className="text-sm text-pink-700">En son AI teknolojisiyle hazırlanır</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-white border-purple-100">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-purple-900">Anında Hazır</h3>
                <p className="text-sm text-purple-700">Seçiminizi yapın ve hemen başlayın</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold text-gray-800 mb-6 text-center"
        >
          Kategori Seçin
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          {renderCategoryCards}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-sm text-gray-500"
        >
          <p>Her kategori için yapay zeka tarafından özel olarak hazırlanan 10 soru bulunmaktadır.</p>
        </motion.div>
      </div>
    </div>
  )
}
