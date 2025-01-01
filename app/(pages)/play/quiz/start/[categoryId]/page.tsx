"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useQuiz } from "@/lib/hooks/useQuiz"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function QuizPage() {
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

  // Sonraki soruya geçme işlemi
  const handleNextQuestion = () => {
    if (!selectedOption) return
    handleAnswer(selectedOption)
    setSelectedOption(null)
  }

  // Quiz'i bitirme işlemi
  const handleFinishQuiz = async () => {
    if (!selectedOption) return
    setIsSubmitting(true)
    await handleAnswer(selectedOption)
    setIsSubmitting(false)
  }

  useEffect(() => {
    const initQuiz = async () => {
      await fetchQuestions()
      setInitialLoading(false)
    }

    if (!isLoading) {
      initQuiz()
    }
  }, [categoryId])

  if (initialLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-red-700 mb-4">
              Hata Oluştu
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Link href="/play/classic">
              <Button variant="outline" className="bg-white hover:bg-gray-50">
                Kategorilere Geri Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  if (!currentQuestion) return null

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {categoryName}
          </h1>
          <div className="flex items-center justify-between">
            <span className="text-base md:text-lg text-gray-600">
              Soru {currentQuestionIndex + 1}/{questions.length}
            </span>
            <div className="w-32 md:w-64 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-orange-600 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <Card className="p-4 md:p-8 mb-6 shadow-md" style={{ minHeight: '250px' }}>
          <h2 className="text-xl md:text-2xl font-semibold mb-6">
            {currentQuestion.question_text}
          </h2>
          <div className="space-y-3 md:space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={cn(
                  "w-full text-left p-3 md:p-4 rounded-lg border-2 transition-all text-sm md:text-base",
                  selectedOption === option
                    ? "border-orange-600 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                )}
                onClick={() => setSelectedOption(option)}
              >
                <span className="font-medium">
                  {String.fromCharCode(65 + index)}.
                </span>{" "}
                {option}
              </button>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          {isLastQuestion ? (
            <Button
              disabled={!selectedOption || isSubmitting}
              onClick={handleFinishQuiz}
              className="bg-green-600 hover:bg-green-700 text-base md:text-lg px-6 md:px-8 py-2 md:py-3 rounded-md transition duration-300"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner />
                  Sonuçlar Hesaplanıyor...
                </div>
              ) : (
                "Sınavı Bitir"
              )}
            </Button>
          ) : (
            <Button
              disabled={!selectedOption}
              onClick={handleNextQuestion}
              className="bg-orange-600 hover:bg-orange-700 text-base md:text-lg px-6 md:px-8 py-2 md:py-3 rounded-md transition duration-300"
            >
              Sonraki Soru
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}