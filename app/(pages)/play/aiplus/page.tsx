"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, AlertCircle } from "lucide-react";

// Kategori validasyon kuralları
const VALIDATION_RULES = {
  category: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s]+$/,
    noConsecutiveSpaces: /\s\s/
  }
} as const

// Form validasyon fonksiyonu
const validateCategory = (value: string): string | null => {
  if (!value.trim()) {
    return "Lütfen bir kategori girin"
  }

  if (value.length < VALIDATION_RULES.category.minLength) {
    return `Kategori en az ${VALIDATION_RULES.category.minLength} karakter olmalıdır`
  }

  if (value.length > VALIDATION_RULES.category.maxLength) {
    return `Kategori en fazla ${VALIDATION_RULES.category.maxLength} karakter olabilir`
  }

  if (!VALIDATION_RULES.category.pattern.test(value)) {
    return "Kategori sadece harf, rakam ve boşluk içerebilir"
  }

  if (VALIDATION_RULES.category.noConsecutiveSpaces.test(value)) {
    return "Art arda boşluk kullanılamaz"
  }

  return null
}

// Örnek kategoriler
const EXAMPLE_CATEGORIES = [
  "Türk Tarihi", "Genel Kültür", "Bilim ve Teknoloji", 
  "Coğrafya", "Edebiyat", "Spor", "Sanat", "Müzik", "Sinema",
  "Bilgisayar", "Matematik", "Fizik", "Kimya", "Biyoloji"
] as const

export default function AiPlusModePage() {
  const router = useRouter()
  const [category, setCategory] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form gönderme işleyicisi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Form gönderilirken yeni gönderimi engelle
    if (isSubmitting) return

    // Kategoriyi temizle
    const cleanedCategory = category.trim()
    
    // Validasyon kontrolü
    const validationError = validateCategory(cleanedCategory)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError("")

    // Quiz sayfasına yönlendir
    router.push(`/play/aiplus/quiz?category=${encodeURIComponent(cleanedCategory)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto"
      >
        {/* Başlık Bölümü */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-400 bg-clip-text text-transparent mb-4"
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

        {/* Form Kartı */}
        <Card className="p-6 md:p-8 bg-white/80 backdrop-blur-sm border-purple-100">
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
                className={`text-lg py-6 transition-all duration-200 ${
                  error 
                    ? "border-red-300 focus:border-red-400 focus:ring-red-400" 
                    : "border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                }`}
                disabled={isSubmitting}
                maxLength={VALIDATION_RULES.category.maxLength}
              />
              {error && (
                <div className="flex items-center gap-2 mt-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
                disabled={isSubmitting}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isSubmitting ? "Hazırlanıyor..." : "Soruları Oluştur"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Not: Kategori adı {VALIDATION_RULES.category.minLength}-{VALIDATION_RULES.category.maxLength} karakter arasında olmalı ve 
                sadece harf, rakam ve boşluk içermelidir.
              </p>
            </div>
          </form>
        </Card>

        {/* Bilgilendirme Kartı */}
        <Card className="mt-6 p-4 bg-purple-50/50 border-purple-100">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-1">Kategori Önerileri</h3>
              <p className="mt-1 text-sm text-purple-700">
                Örnek kategoriler: {EXAMPLE_CATEGORIES.join(", ")}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
