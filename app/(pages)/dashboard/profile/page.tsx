"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Trophy, PieChart, BarChart } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { QuizHistory } from "@/types/quiz"
import { StatCardProps, DetailStatProps, QuizHistoryItemProps } from "@/types/components"

// Tip tanımlamaları
interface UserStats {
  username: string
  created_at: string
  total_score: number
  total_play_count: number
  total_questions_attempted: number
  total_correct_answers: number
}

export default function ProfilePage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 5

  // Profil verilerini çek
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [statsResponse, historyResponse] = await Promise.all([
          fetch("/api/auth"),
          fetch("/api/users/history"),
        ])

        const statsData = await statsResponse.json()
        const historyData = await historyResponse.json()

        if (!statsResponse.ok) throw new Error(statsData.error)
        if (!historyResponse.ok) throw new Error(historyData.error)

        setStats(statsData.data.user)
        setQuizHistory(Array.isArray(historyData.data.data) ? historyData.data.data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Veriler alınamadı")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  // Sayfalama işlemleri
  const handleNextPage = () => {
    if ((currentPage + 1) * itemsPerPage < quizHistory.length) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner className="h-8 w-8" /></div>
  }

  if (error || !stats) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">{error || "Kullanıcı bilgileri alınamadı"}</p>
      </div>
    )
  }

  const paginatedQuizHistory = quizHistory.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">{stats.username}</h1>
          <p className="text-sm md:text-base text-gray-600">Üyelik: {formatDate(stats.created_at)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <StatCard
            icon={<Trophy className="w-6 md:w-8 h-6 md:h-8 text-yellow-500" />}
            title="Toplam Puan"
            value={stats.total_score || 0}
            description="Tüm zamanlar"
          />
          <StatCard
            icon={<PieChart className="w-6 md:w-8 h-6 md:h-8 text-blue-500" />}
            title="Başarı Oranı"
            value={`%${stats.total_play_count > 0 
              ? Math.round(stats.total_score / stats.total_play_count) 
              : 0}`}
            description="Doğru cevap yüzdesi"
          />
          <StatCard
            icon={<BarChart className="w-6 md:w-8 h-6 md:h-8 text-green-500" />}
            title="Toplam Quiz"
            value={stats.total_play_count || 0}
            description="Tamamlanan"
          />
        </div>

        <Card className="p-4 md:p-6 mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Detaylı İstatistikler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetailStat title="Toplam Soru" value={stats.total_questions_attempted || 0} />
            <DetailStat title="Doğru Cevap" value={stats.total_correct_answers || 0} />
            <DetailStat title="Yanlış Cevap" value={(stats.total_questions_attempted || 0) - (stats.total_correct_answers || 0)} />
            <DetailStat title="Ortalama Puan" value={Math.round((stats.total_score || 0) / (stats.total_play_count || 1))} />
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Quiz Geçmişi</h2>
          <div className="space-y-4">
            {paginatedQuizHistory.map((quiz) => (
              <QuizHistoryItem key={quiz.id} quiz={quiz} />
            ))}
          </div>

          {quizHistory.length > itemsPerPage && (
            <div className="flex justify-between mt-6">
              <Button 
                onClick={handlePrevPage} 
                disabled={currentPage === 0}
                variant="outline"
                className="text-sm md:text-base"
              >
                Önceki
              </Button>
              <span className="text-sm md:text-base text-gray-600">
                Sayfa {currentPage + 1} / {Math.ceil(quizHistory.length / itemsPerPage)}
              </span>
              <Button 
                onClick={handleNextPage} 
                disabled={(currentPage + 1) * itemsPerPage >= quizHistory.length}
                variant="outline"
                className="text-sm md:text-base"
              >
                Sonraki
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// Alt bileşenler
function StatCard({ icon, title, value, description }: StatCardProps) {
  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center space-x-4">
        {icon}
        <div>
          <h3 className="text-base md:text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-xl md:text-3xl font-bold text-orange-600">{value}</p>
          <p className="text-xs md:text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  )
}

function DetailStat({ title, value }: DetailStatProps) {
  return (
    <div className="text-center">
      <p className="text-xs md:text-sm text-gray-600">{title}</p>
      <p className="text-lg md:text-2xl font-bold text-gray-800">{value}</p>
    </div>
  )
}

function QuizHistoryItem({ quiz }: QuizHistoryItemProps) {
  const router = useRouter()
  
  return (
    <div className="border-b border-gray-200 pb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h3 className="font-semibold text-gray-800">{quiz.categoryName}</h3>
          <p className="text-xs md:text-sm text-gray-600">{formatDate(quiz.playedAt)}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-base md:text-lg font-bold text-orange-600">%{quiz.score}</p>
            <p className="text-xs md:text-sm text-gray-600">{quiz.correctAnswers}/{quiz.totalQuestions} Doğru</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => router.push(`/play/quiz/result?quizId=${quiz.id}`)}
            className="text-sm md:text-base"
          >
            Detaylar
          </Button>
        </div>
      </div>
    </div>
  )
}