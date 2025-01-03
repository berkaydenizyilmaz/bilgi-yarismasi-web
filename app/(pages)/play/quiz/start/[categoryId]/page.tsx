"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useQuiz } from "@/lib/hooks/useQuiz"
import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, AlertCircle } from "lucide-react"

// Animasyon sabitleri
const ANIMATION_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
} as const

// Seçenek tipi
type Option = string

export default function QuizPage() {
  // State ve hooks
  const { categoryId } = useParams<{ categoryId: string }>()
  const searchParams = useSearchParams()
  const categoryName = searchParams.get("name")
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const {
    questions,
    currentQuestionIndex,
    isLoading,
    error,
    fetchQuestions,
    handleAnswer,
  } = useQuiz(categoryId)

  // Sonraki soruya geçme işleyicisi - Memoized
  const handleNextQuestion = useCallback(() => {
    if (!selectedOption) return
    handleAnswer(selectedOption)
    setSelectedOption(null)
  }, [selectedOption, handleAnswer])

  // Quiz'i bitirme işleyicisi - Memoized
  const handleFinishQuiz = useCallback(async () => {
    if (!selectedOption) return
    setIsSubmitting(true)
    await handleAnswer(selectedOption)
    setIsSubmitting(false)
  }, [selectedOption, handleAnswer])

  // İlk yüklemede soruları bir kez getir
  useEffect(() => {
    let isMounted = true

    const initQuiz = async () => {
      if (questions.length === 0 && initialLoading) {
        await fetchQuestions()
      }
      if (isMounted) {
        setInitialLoading(false)
      }
    }

    initQuiz()

    return () => {
      isMounted = false
    }
  }, [categoryId])

  // Yükleme durumu
  if (initialLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  // Hata durumu
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-red-50 border-red-200 p-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <h2 className="text-xl font-semibold text-red-700">
                Hata Oluştu
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Link href="/play/classic">
                <Button variant="outline" className="bg-white hover:bg-gray-50">
                  Kategorilere Geri Dön
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  if (!currentQuestion) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Üst Bilgi Kartı */}
        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-orange-600 to-red-500 text-white p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-medium opacity-90">
                {categoryName}
              </h2>
              <p className="text-xs sm:text-sm md:text-base opacity-75">
                Klasik Quiz Modu
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 opacity-75" />
              <span className="text-base sm:text-lg font-semibold">
                {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
          </div>
        </Card>

        {/* Soru Kartı */}
        <Card className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
          {/* İlerleme Çubuğu */}
          <div className="h-1.5 sm:h-2 bg-gray-100 rounded-t-lg overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Soru Metni */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={ANIMATION_VARIANTS.initial}
                animate={ANIMATION_VARIANTS.animate}
                exit={ANIMATION_VARIANTS.exit}
                transition={{ duration: 0.3 }}
                className="mb-6 sm:mb-8"
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed">
                  {currentQuestion.question_text}
                </h2>
              </motion.div>
            </AnimatePresence>

            {/* Seçenekler */}
            <div className="space-y-3 sm:space-y-4">
              {currentQuestion.options.map((option: Option, index: number) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedOption(option)}
                  className={cn(
                    "group w-full p-3 sm:p-4 text-left rounded-xl border-2 transition-all duration-200 relative overflow-hidden",
                    selectedOption === option
                      ? "border-orange-500 bg-orange-50/80"
                      : "border-gray-100 hover:border-orange-300 hover:bg-orange-50/50"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                  />
                  
                  <div className="relative flex items-center gap-2 sm:gap-3">
                    <span className={cn(
                      "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg text-sm sm:text-base font-semibold transition-colors duration-200",
                      selectedOption === option
                        ? "bg-orange-500 text-white"
                        : "bg-orange-100 text-orange-600 group-hover:bg-orange-200"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 
                      transition-colors duration-200">
                      {option}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* İlerleme Butonu */}
            <motion.div 
              className="flex justify-end mt-6 sm:mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isLastQuestion ? (
                <Button
                  disabled={!selectedOption || isSubmitting}
                  onClick={handleFinishQuiz}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600
                    text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-xl text-sm sm:text-base
                    transition duration-300 flex items-center gap-2 min-w-[160px] justify-center"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner className="w-5 h-5" />
                      <span>Hesaplanıyor...</span>
                    </div>
                  ) : (
                    "Sınavı Bitir"
                  )}
                </Button>
              ) : (
                <Button
                  disabled={!selectedOption}
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600
                    text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-xl text-sm sm:text-base
                    transition duration-300"
                >
                  Sonraki Soru
                </Button>
              )}
            </motion.div>
          </div>
        </Card>
      </div>
    </div>
  )
}