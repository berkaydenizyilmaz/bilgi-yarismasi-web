"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useQuiz } from "@/lib/hooks/useQuiz"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function QuizPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const searchParams = useSearchParams()
  const categoryName = searchParams.get("name")
  const { user } = useAuth()

  const {
    questions,
    currentQuestionIndex,
    isLoading,
    error,
    fetchQuestions,
    handleAnswer,
  } = useQuiz(categoryId)

  useEffect(() => {
    if (!isLoading) {
      fetchQuestions()
    }
  }, [categoryId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-700 mb-4">
              Hata
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Link href="/quiz/categories">
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

  if (!currentQuestion) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {categoryName} - Soru {currentQuestionIndex + 1}/{questions.length}
          </h1>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {currentQuestion.question_text}
          </h2>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full text-left justify-start h-auto py-3 px-4"
                onClick={() => handleAnswer(option)}
              >
                {String.fromCharCode(65 + index)}. {option}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}