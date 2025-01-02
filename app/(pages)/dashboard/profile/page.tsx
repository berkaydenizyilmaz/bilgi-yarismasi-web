"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Trophy, PieChart, BarChart, MessageSquare, CheckCircle, XCircle, Star, ChevronLeft, ChevronRight, ArrowRight, Calendar } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              {stats?.username}
            </span>
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-400" />
            Üyelik Tarihi: {formatDate(stats?.created_at || '')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            icon={<Trophy className="w-8 h-8 text-yellow-500" />}
            title="Toplam Puan"
            value={stats?.total_score || 0}
            description="Tüm zamanlar"
            gradient="from-yellow-500 to-orange-400"
          />
          <StatCard
            icon={<PieChart className="w-8 h-8 text-blue-500" />}
            title="Başarı Oranı"
            value={`%${stats?.total_play_count ? Math.round(stats.total_score / stats.total_play_count) : 0}`}
            description="Doğru cevap yüzdesi"
            gradient="from-blue-500 to-cyan-400"
          />
          <StatCard
            icon={<BarChart className="w-8 h-8 text-green-500" />}
            title="Toplam Quiz"
            value={stats?.total_play_count || 0}
            description="Tamamlanan"
            gradient="from-green-500 to-emerald-400"
          />
        </div>

        <Card className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl mb-12 border-0">
          <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Detaylı İstatistikler
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <DetailStat 
              title="Toplam Soru" 
              value={stats?.total_questions_attempted || 0}
              icon={<MessageSquare className="w-5 h-5 text-orange-500" />}
            />
            <DetailStat 
              title="Doğru Cevap" 
              value={stats?.total_correct_answers || 0}
              icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            />
            <DetailStat 
              title="Yanlış Cevap" 
              value={(stats?.total_questions_attempted || 0) - (stats?.total_correct_answers || 0)}
              icon={<XCircle className="w-5 h-5 text-red-500" />}
            />
            <DetailStat 
              title="Ortalama Puan" 
              value={Math.round((stats?.total_score || 0) / (stats?.total_play_count || 1))}
              icon={<Star className="w-5 h-5 text-yellow-500" />}
            />
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-0">
          <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Quiz Geçmişi
          </h2>
          <div className="space-y-6">
            {paginatedQuizHistory.map((quiz) => (
              <QuizHistoryItem key={quiz.id} quiz={quiz} />
            ))}
          </div>

          {quizHistory.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              <Button 
                onClick={handlePrevPage} 
                disabled={currentPage === 0}
                variant="outline"
                className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Önceki
              </Button>
              <span className="text-gray-600 font-medium">
                Sayfa {currentPage + 1} / {Math.ceil(quizHistory.length / itemsPerPage)}
              </span>
              <Button 
                onClick={handleNextPage} 
                disabled={(currentPage + 1) * itemsPerPage >= quizHistory.length}
                variant="outline"
                className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
              >
                Sonraki
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// Alt bileşenler güncellendi
function StatCard({ icon, title, value, description, gradient }: StatCardProps & { gradient: string }) {
  return (
    <Card className="relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-gray-50 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1`}>
          {value}
        </p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  )
}

function DetailStat({ title, value, icon }: DetailStatProps & { icon: React.ReactNode }) {
  return (
    <div className="text-center p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors group">
      <div className="flex justify-center mb-3">
        <div className="p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  )
}

function QuizHistoryItem({ quiz }: QuizHistoryItemProps) {
  const router = useRouter()
  
  return (
    <div className="group p-4 rounded-xl hover:bg-gray-50/80 transition-colors border border-gray-100 hover:border-orange-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
            {quiz.categoryName}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(quiz.playedAt)}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-lg font-bold text-orange-600">%{quiz.score}</p>
            <p className="text-sm text-gray-600">{quiz.correctAnswers}/{quiz.totalQuestions} Doğru</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => router.push(`/play/quiz/result?quizId=${quiz.id}`)}
            className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
          >
            Detaylar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}