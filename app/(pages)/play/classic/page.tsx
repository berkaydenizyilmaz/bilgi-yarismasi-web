"use client"

import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useCategories } from "@/lib/hooks/useCategories"
import { BookOpen } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ClassicModePage() {
  const { categories, isLoading, error } = useCategories()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

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

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId)
    router.push(`/play/quiz/start/${categoryId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Başlık Bölümü */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-orange-600 mb-3">
            Klasik Mod
          </h1>
          <p className="text-xl md:text-3xl text-gray-800">
            Quiz çözmeye başlamak için bir kategori seçin
          </p>
        </div>

        {/* Kategoriler Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="flex justify-center">
                <Button 
                  onClick={() => handleCategorySelect(category.id)} 
                  className={`
                    relative w-full h-32 md:h-40 
                    flex flex-col items-center justify-center 
                    text-base md:text-lg font-semibold rounded-lg 
                    transition-all duration-300 gap-3
                    ${selectedCategory === category.id 
                      ? 'bg-orange-600 text-white shadow-lg scale-105' 
                      : 'bg-white text-orange-600 border-2 border-orange-600 hover:bg-orange-50'
                    }
                  `}
                >
                  <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
                  <span className="text-center px-2">{category.name}</span>
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-600 py-8">
              Hiç kategori bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}