"use client";

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatDate } from "@/lib/utils"
import { PieChart, BarChart, Trophy, CornerRightDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface UserStats {
  id: number
  username: string
  email: string
  total_play_count: number
  total_questions_attempted: number
  total_correct_answers: number
  total_score: number
  created_at: string
  averageScore: number
}

interface QuizHistory {
  id: number
  categoryName: string
  score: number
  correctAnswers: number
  totalQuestions: number
  playedAt: string
}

export default function ProfilePage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">{error || "Kullanıcı bilgileri alınamadı"}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Profil Başlığı */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{stats.username || "Kullanıcı Adı Yok"}</h1>
          <p className="text-gray-600">Üyelik Tarihi: {formatDate(stats.created_at) || "Tarih Bilgisi Yok"}</p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Trophy className="w-8 h-8 text-yellow-500" />}
            title="Toplam Puan"
            value={stats.total_score || 0}
            description="Tüm zamanlar"
          />
          <StatCard
            icon={<PieChart className="w-8 h-8 text-blue-500" />}
            title="Başarı Oranı"
            value={`%${stats.total_play_count > 0 
              ? Math.round(stats.total_score / stats.total_play_count) 
              : 0}`}
            description="Doğru cevap yüzdesi"
          />
          <StatCard
            icon={<BarChart className="w-8 h-8 text-green-500" />}
            title="Toplam Quiz"
            value={stats.total_play_count || 0}
            description="Tamamlanan"
          />
        </div>

        {/* Detaylı İstatistikler */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Detaylı İstatistikler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetailStat
              title="Toplam Soru"
              value={stats.total_questions_attempted || 0}
            />
            <DetailStat
              title="Doğru Cevap"
              value={stats.total_correct_answers || 0}
            />
            <DetailStat
              title="Yanlış Cevap"
              value={(stats.total_questions_attempted || 0) - (stats.total_correct_answers || 0)}
            />
            <DetailStat
              title="Ortalama Puan"
              value={Math.round((stats.total_score || 0) / (stats.total_play_count || 1))}
            />
          </div>
        </Card>

        {/* Quiz Geçmişi */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Quiz Geçmişi</h2>
          <div className="space-y-4">
            {quizHistory.map((quiz) => (
              <QuizHistoryItem key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number | string
  description: string
}

function StatCard({ icon, title, value, description }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4">
        {icon}
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-3xl font-bold text-orange-600">{value}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  )
}

interface DetailStatProps {
  title: string
  value: number
}

function DetailStat({ title, value }: DetailStatProps) {
  return (
    <div className="text-center">
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  )
}

interface QuizHistoryItemProps {
  quiz: QuizHistory
}

function QuizHistoryItem({ quiz }: QuizHistoryItemProps) {
  const router = useRouter();
  
  return (
    <div className="border-b border-gray-200 pb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800">{quiz.categoryName}</h3> 
          <p className="text-sm text-gray-600">
            {formatDate(quiz.playedAt)} 
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-lg font-bold text-orange-600">%{quiz.score}</p> 
            <p className="text-sm text-gray-600">
              {quiz.correctAnswers}/{quiz.totalQuestions} Doğru 
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => router.push(`/quiz/result?quizId=${quiz.id}`)}
            className="ml-4"
          >
            Detaylar
          </Button>
        </div>
      </div>
    </div>
  );
}