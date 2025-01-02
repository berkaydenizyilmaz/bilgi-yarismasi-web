"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, AlertCircle } from "lucide-react";

// Kategori minimum ve maksimum uzunlukları
const MIN_CATEGORY_LENGTH = 3;
const MAX_CATEGORY_LENGTH = 50;

export default function AiPlusModePage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateCategory = (value: string): string | null => {
    // Boş kontrolü
    if (!value.trim()) {
      return "Lütfen bir kategori girin";
    }

    // Uzunluk kontrolü
    if (value.length < MIN_CATEGORY_LENGTH) {
      return `Kategori en az ${MIN_CATEGORY_LENGTH} karakter olmalıdır`;
    }

    if (value.length > MAX_CATEGORY_LENGTH) {
      return `Kategori en fazla ${MAX_CATEGORY_LENGTH} karakter olabilir`;
    }

    // Sadece harf, rakam ve boşluk kontrolü
    if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s]+$/.test(value)) {
      return "Kategori sadece harf, rakam ve boşluk içerebilir";
    }

    // Art arda boşluk kontrolü
    if (/\s\s/.test(value)) {
      return "Art arda boşluk kullanılamaz";
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form gönderilirken yeni gönderimi engelle
    if (isSubmitting) return;

    // Kategoriyi temizle (baştaki ve sondaki boşlukları kaldır)
    const cleanedCategory = category.trim();
    
    // Validasyon kontrolü
    const validationError = validateCategory(cleanedCategory);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Yönlendirme
    router.push(`/play/aiplus/quiz?category=${encodeURIComponent(cleanedCategory)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto"
      >
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
                  setCategory(e.target.value);
                  setError("");
                }}
                placeholder="Örn: Türk Edebiyatı, Dünya Tarihi, Bilim..."
                className={`text-lg py-6 transition-all duration-200 ${
                  error 
                    ? "border-red-300 focus:border-red-400 focus:ring-red-400" 
                    : "border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                }`}
                disabled={isSubmitting}
                maxLength={MAX_CATEGORY_LENGTH}
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
                Not: Kategori adı {MIN_CATEGORY_LENGTH}-{MAX_CATEGORY_LENGTH} karakter arasında olmalı ve 
                sadece harf, rakam ve boşluk içermelidir.
              </p>
            </div>
          </form>
        </Card>

        {/* Bilgilendirme kartı */}
        <Card className="mt-6 p-4 bg-purple-50/50 border-purple-100">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-purple-900">Kategori Önerileri</h3>
              <p className="mt-1 text-sm text-purple-700">
                Örnek kategoriler: Türk Tarihi, Genel Kültür, Bilim ve Teknoloji, 
                Coğrafya, Edebiyat, Spor, Sanat, Müzik, Sinema, Bilgisayar, 
                Matematik, Fizik, Kimya, Biyoloji
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
