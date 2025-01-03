"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Trophy, CheckCircle2, XCircle, Sparkles, Home, RotateCcw } from "lucide-react"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { motion, AnimatePresence } from "framer-motion"
import { memo } from "react"

// Tip tanımlamaları
interface Question {
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correct_option: "A" | "B" | "C" | "D"
  userAnswer?: string
  isCorrect?: boolean
}

// Soru kartı bileşeni - Performans için memoize edildi
const QuestionCard = memo(({ 
  questionNumber, 
  question 
}: { 
  questionNumber: number
  question: Question 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: questionNumber * 0.1 }}
    >
      <Card 
        className={`p-4 md:p-6 mb-4 bg-white/80 backdrop-blur-sm transition-all duration-300 cursor-pointer
          hover:shadow-md ${isExpanded ? 'ring-2 ring-purple-400' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Soru Başlığı */}
        <div className="flex items-start justify-between">
          <h3 className="text-base md:text-lg font-semibold mb-2 flex-1 pr-4">
            <span className="text-purple-600 mr-2">#{questionNumber}</span>
            {question.question}
          </h3>
          <span className={`text-2xl ${question.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {question.isCorrect ? '✓' : '✗'}
          </span>
        </div>

        {/* Seçenekler - Genişletildiğinde göster */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 mt-4"
            >
              {Object.entries(question.options).map(([key, value]) => {
                const isUserAnswer = question.userAnswer === key
                const isCorrectAnswer = question.correct_option === key

                // Seçenek stilleri
                let optionStyle = "bg-white/50 border border-gray-100"
                let textStyle = "text-gray-600"
                let keyStyle = "bg-gray-100 text-gray-600"

                if (isUserAnswer && question.isCorrect) {
                  optionStyle = "bg-green-100 border border-green-200"
                  textStyle = "text-green-700"
                  keyStyle = "bg-green-500 text-white"
                } else if (isUserAnswer && !question.isCorrect) {
                  optionStyle = "bg-red-100 border border-red-200"
                  textStyle = "text-red-700"
                  keyStyle = "bg-red-500 text-white"
                } else if (isCorrectAnswer && !question.isCorrect) {
                  optionStyle = "bg-green-100 border border-green-200"
                  textStyle = "text-green-700"
                  keyStyle = "bg-green-500 text-white"
                }

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-lg flex justify-between items-center ${optionStyle}`}
                  >
                    <span className={`flex items-center gap-2 ${textStyle}`}>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md 
                        font-medium ${keyStyle}`}>
                        {key}
                      </span>
                      {value}
                    </span>
                    {(isUserAnswer || isCorrectAnswer) && (
                      <span className="ml-2">
                        {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {isUserAnswer && !question.isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                      </span>
                    )}
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
})

// İstatistik kartı bileşeni - Performans için memoize edildi
const StatCard = memo(({ 
  icon, 
  title, 
  value, 
  className = "",
  delay = 0 
}: { 
  icon: React.ReactNode
  title: string
  value: string
  className?: string
  delay?: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-4">
          {icon}
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
})

// Ana içerik bileşeni
function ResultContent() {
  // State ve hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode")
  const categoryId = searchParams.get("category")
  const score = parseInt(searchParams.get("score") || "0")
  const correct = parseInt(searchParams.get("correct") || "0")
  const incorrect = parseInt(searchParams.get("incorrect") || "0")
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [categoryName, setCategoryName] = useState("")

  // Kategori adını getir
  const fetchCategoryName = useCallback(async () => {
    if (!categoryId) return

    try {
      const response = await fetch(`/api/categories/${categoryId}`)
      const data = await response.json()
      setCategoryName(data.data.name)
    } catch (error) {
      console.error("Kategori adı alınamadı:", error)
    }
  }, [categoryId])

  // Soruları ve kategori adını yükle
  useEffect(() => {
    const savedQuestions = localStorage.getItem('aiQuizQuestions')
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions))
    }

    if (mode === "ai") {
      fetchCategoryName()
    }
  }, [mode, fetchCategoryName])

  // Geri tuşu yönetimi
  useEffect(() => {
    const handlePopState = () => {
      router.push('/play')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [router])

  // Skor mesajı ve rengi - Memoized
  const scoreMessage = useMemo(() => {
    if (score >= 90) return "Mükemmel!"
    if (score >= 70) return "Çok İyi!"
    if (score >= 50) return "İyi!"
    return "Geliştirebilirsin!"
  }, [score])

  const scoreColor = useMemo(() => {
    if (score >= 90) return "text-purple-600"
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-blue-600"
    return "text-orange-600"
  }, [score])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Başlık ve Skor */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-400 
            bg-clip-text text-transparent mb-3 sm:mb-4">
            {scoreMessage}
          </h1>
          {(mode === "ai" ? categoryName : categoryId) && (
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mt-2">
              {mode === "ai" ? categoryName : decodeURIComponent(categoryId || "")}
            </p>
          )}
          <motion.p 
            className={`text-4xl sm:text-5xl md:text-6xl font-bold mt-4 ${scoreColor}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            %{score}
          </motion.p>
        </motion.div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <StatCard
            icon={<Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />}
            title="Başarı Puanı"
            value={`%${score}`}
            className="bg-purple-50"
            delay={0.4}
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />}
            title="Doğru Cevap"
            value={correct.toString()}
            className="bg-green-50"
            delay={0.5}
          />
          <StatCard
            icon={<XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />}
            title="Yanlış Cevap"
            value={incorrect.toString()}
            className="bg-red-50"
            delay={0.6}
          />
        </div>

        {/* Soru Listesi */}
        <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          {questions.map((question, index) => (
            <QuestionCard
              key={index}
              questionNumber={index + 1}
              question={question}
            />
          ))}
        </div>

        {/* Aksiyon Butonları */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link href="/play">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 
              text-white font-semibold py-4 px-6 rounded-xl text-base flex items-center gap-2 w-full sm:w-auto">
              <Home className="w-5 h-5" />
              Ana Sayfaya Dön
            </Button>
          </Link>
          <Link href={mode === "ai" ? `/play/ai?categoryId=${categoryId}` : `/play/aiplus?category=${categoryId}`}>
            <Button variant="outline" className="font-semibold py-4 px-6 rounded-xl text-base 
              flex items-center gap-2 w-full sm:w-auto">
              <RotateCcw className="w-5 h-5" />
              Tekrar Dene
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

// Ana bileşen
export default function ResultPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResultContent />
    </Suspense>
  )
}