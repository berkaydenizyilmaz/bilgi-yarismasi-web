"use client";

import { useCategories } from "@/lib/hooks/useCategories";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BookOpen } from "lucide-react";

export default function AiModePage() {
  const { categories, isLoading, error } = useCategories()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        {error}
      </div>
    )
  }

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId)
    router.push(`/play/ai/quiz?categoryId=${categoryId}`)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-4"
          >
            Yapay Zeka Modu
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600"
          >
            Yapay zeka tarafından üretilecek sorular için bir kategori seçin
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4"
        >
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((category) => (
              <motion.div 
                key={category.id}
                variants={item}
                className="flex justify-center"
                onHoverStart={() => setHoveredCategory(category.id)}
                onHoverEnd={() => setHoveredCategory(null)}
              >
                <Button 
                  onClick={() => handleCategorySelect(category.id)} 
                  className={`
                    relative w-full h-40 md:h-48
                    flex flex-col items-center justify-center 
                    text-lg md:text-xl font-semibold
                    rounded-2xl
                    transition-all duration-300 gap-4
                    ${selectedCategory === category.id 
                      ? 'bg-gradient-to-br from-orange-600 to-orange-400 text-white shadow-lg scale-105' 
                      : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:shadow-lg hover:scale-[1.02]'
                    }
                  `}
                >
                  <div className={`
                    p-4 rounded-full 
                    ${hoveredCategory === category.id ? 'bg-white/80' : 'bg-orange-50'}
                    transition-colors duration-300
                  `}>
                    <BookOpen className={`
                      h-8 w-8 md:h-10 md:w-10
                      ${hoveredCategory === category.id ? 'text-orange-600' : 'text-orange-500'}
                      transition-colors duration-300
                    `} />
                  </div>
                  <span className="text-center px-4 transition-colors duration-300">
                    {category.name}
                  </span>
                </Button>
              </motion.div>
            ))
          ) : (
            <motion.div 
              variants={item}
              className="col-span-full text-center text-gray-600 py-12 bg-white rounded-2xl shadow-sm"
            >
              Hiç kategori bulunamadı.
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
