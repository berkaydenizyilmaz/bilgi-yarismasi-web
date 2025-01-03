"use client"

import React, { useCallback, useMemo, useState } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Category, useCategories } from "@/lib/hooks/useCategories"
import { BookOpen, Sparkles, Stars } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

// Animasyon varyantları
const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }
} as const

// Özellik kartları için tip tanımı
type FeatureCard = {
  icon: typeof Sparkles | typeof BookOpen | typeof Stars
  title: string
  description: string
  gradient: string
  border: string
  iconBg: string
  textColor: string
  descColor: string
}

// Özellik kartları sabitleri
const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: Sparkles,
    title: "Test Edilmiş Sorular",
    description: "Uzmanlar tarafından hazırlanmış sorular",
    gradient: "from-orange-50 to-white",
    border: "border-orange-100",
    iconBg: "bg-orange-100",
    textColor: "text-orange-900",
    descColor: "text-orange-700"
  },
  {
    icon: BookOpen,
    title: "Geniş Soru Havuzu",
    description: "Binlerce farklı soru içeriği",
    gradient: "from-red-50 to-white",
    border: "border-red-100",
    iconBg: "bg-red-100",
    textColor: "text-red-900",
    descColor: "text-red-700"
  },
  {
    icon: Stars,
    title: "Klasik Deneyim",
    description: "Geleneksel quiz formatı",
    gradient: "from-orange-50 to-white",
    border: "border-orange-100",
    iconBg: "bg-orange-100",
    textColor: "text-orange-900",
    descColor: "text-orange-700"
  }
] as const

// Özellik kartı bileşeni - Performans için memoize edildi
const FeatureCard = React.memo(({ feature }: { feature: FeatureCard }) => (
  <Card className={`p-4 bg-gradient-to-br ${feature.gradient} ${feature.border}`}>
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${feature.iconBg}`}>
        <feature.icon className="w-5 h-5 text-orange-600" />
      </div>
      <div>
        <h3 className={`font-medium ${feature.textColor}`}>{feature.title}</h3>
        <p className={`text-sm ${feature.descColor}`}>{feature.description}</p>
      </div>
    </div>
  </Card>
))

// Kategori kartı bileşeni - Performans için memoize edildi
const CategoryCard = React.memo(({ 
  category, 
  index, 
  onClick 
}: { 
  category: Category
  index: number
  onClick: () => void 
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    onClick={onClick}
    className="group cursor-pointer"
  >
    <Card className="relative h-32 sm:h-40 overflow-hidden transition-all duration-300 
      hover:shadow-lg border-2 border-orange-100 hover:border-orange-200
      bg-gradient-to-br from-white to-orange-50"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-red-500/5 
        opacity-50 group-hover:opacity-100 transition-opacity duration-300" 
      />
      
      <div className="relative h-full p-4 flex flex-col items-center justify-center">
        <div className="mb-3 p-2 rounded-full bg-gradient-to-br from-orange-100 to-red-100 
          group-hover:from-orange-200 group-hover:to-red-200 transition-colors duration-300">
          {index % 2 === 0 ? (
            <Sparkles className="w-5 h-5 text-orange-500" />
          ) : (
            <Stars className="w-5 h-5 text-orange-500" />
          )}
        </div>

        <h2 className="text-base sm:text-lg font-medium text-center text-gray-800 
          group-hover:text-orange-600 transition-colors duration-300">
          {category.name}
        </h2>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 
          transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" 
        />
      </div>
    </Card>
  </motion.div>
))

export default function ClassicModePage() {
  // Hooks ve state
  const { categories, isLoading, error } = useCategories()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  // Kategori seçim işleyicisi - Memoized
  const handleCategorySelect = useCallback((categoryId: number) => {
    setSelectedCategory(categoryId)
    router.push(`/play/quiz/start/${categoryId}`)
  }, [router])

  // Özellik kartlarını render et - Memoized
  const renderFeatureCards = useMemo(() => (
    FEATURE_CARDS.map((feature, index) => (
      <FeatureCard key={index} feature={feature} />
    ))
  ), [])

  // Kategori kartlarını render et - Memoized
  const renderCategoryCards = useMemo(() => (
    categories.map((category: Category, index: number) => (
      <CategoryCard 
        key={category.id}
        category={category}
        index={index}
        onClick={() => handleCategorySelect(category.id)}
      />
    ))
  ), [categories, handleCategorySelect])

  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  // Hata durumu
  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Başlık Bölümü */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-2 bg-orange-100 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-400 bg-clip-text text-transparent">
            Klasik Mod
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Klasik bilgi yarışması deneyimi için bir kategori seçin ve hemen başlayın.
          </p>
        </motion.div>

        {/* Özellik Kartları */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          {renderFeatureCards}
        </motion.div>

        {/* Kategori Başlığı */}
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold text-gray-800 mb-6 text-center"
        >
          Kategori Seçin
        </motion.h2>

        {/* Kategori Kartları */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          {renderCategoryCards}
        </motion.div>

        {/* Alt Bilgi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-sm text-gray-500"
        >
          <p>Her kategoride çeşitli zorluk seviyelerinde sorular bulunmaktadır.</p>
        </motion.div>
      </div>
    </div>
  )
}