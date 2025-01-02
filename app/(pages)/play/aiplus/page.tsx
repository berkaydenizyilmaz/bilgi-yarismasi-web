"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function AiPlusModePage() {
  const router = useRouter()
  const [category, setCategory] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!category.trim()) {
      setError("Lütfen bir kategori girin")
      return
    }

    if (category.length < 3) {
      setError("Kategori en az 3 karakter olmalıdır")
      return
    }

    router.push(`/play/aiplus/quiz?category=${encodeURIComponent(category)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-4"
          >
            Yapay Zeka+ Modu
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600"
          >
            İstediğiniz konuda sorular üretilmesi için bir kategori girin
          </motion.p>
        </div>

        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="category" className="text-lg font-medium text-gray-700">
                Kategori
              </label>
              <Input
                id="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setError("")
                }}
                placeholder="Örn: Türk Edebiyatı, Dünya Tarihi, Bilim..."
                className={`text-lg py-6 ${error ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            <Button type="submit" className="w-full text-base px-6 py-2 md:px-8 md:py-3">
              Kategori Seç
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
