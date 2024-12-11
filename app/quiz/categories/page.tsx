"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Brain, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

interface Category {
  id: number
  name: string
  description: string | null
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error.message || "Kategoriler yüklenemedi")
        }

        setCategories(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Quiz Kategorileri</h1>
          <p className="text-lg text-gray-600">Kendini test etmek istediğin kategoriyi seç ve yarışmaya başla!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.03 }}
              className={`
                relative overflow-hidden rounded-xl shadow-lg transition-all
                ${selectedCategory?.id === category.id ? 'ring-2 ring-orange-500' : ''}
              `}
              onClick={() => setSelectedCategory(category)}
            >
              <div className="bg-white p-6 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Brain className="h-6 w-6 text-orange-600" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {category.description || `${category.name} kategorisinde kendini test et!`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedCategory.name} kategorisinde yarışmaya hazır mısın?
              </h2>
              <p className="text-gray-600 mb-6">
                Bu kategoride en iyi skorunu elde etmeye çalış!
              </p>
              <Link 
                href={`/quiz/start/${selectedCategory.id}`}
                className="inline-block bg-orange-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Yarışmaya Başla
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}