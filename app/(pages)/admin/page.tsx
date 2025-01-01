"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/swr-config"
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Chart.js bileşenlerini kaydet
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Tip tanımlamaları
interface QuizCountByDate {
  date: string
  count: number
}

interface QuestionsCountByCategory {
  categoryId: number
  categoryName: string
  questionCount: number
}

interface StatisticsData {
  totalUsers: number
  totalFeedback: number
  totalLogs: number
  totalQuizzes: number
  totalQuestions: number
  quizzesCountByDate: QuizCountByDate[]
  questionsCountByCategory: QuestionsCountByCategory[]
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="p-4 md:p-6">
      <h3 className="text-sm md:text-base text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
    </Card>
  )
}

export default function AdminStatistics() {
  const { data, error, isLoading } = useSWR<{ data: StatisticsData }>('/api/admin/statistics', fetcher)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Veriler alınamadı</p>
      </div>
    )
  }

  const chartData = {
    labels: data.data.quizzesCountByDate.map(item => item.date),
    datasets: [
      {
        label: 'Günlük Quiz Sayısı',
        data: data.data.quizzesCountByDate.map(item => item.count),
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        borderColor: 'rgb(249, 115, 22)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
        İstatistikler
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <StatCard title="Toplam Kullanıcı" value={data.data.totalUsers} />
        <StatCard title="Toplam Quiz" value={data.data.totalQuizzes} />
        <StatCard title="Toplam Soru" value={data.data.totalQuestions} />
        <StatCard title="Toplam Geri Bildirim" value={data.data.totalFeedback} />
        <StatCard title="Toplam Log" value={data.data.totalLogs} />
      </div>

      <Card className="p-4 md:p-6 mt-6 md:mt-8">
        <h3 className="text-xl md:text-2xl font-semibold mb-4">Tarihe Göre Çözülen Quiz İstatistikleri</h3>
        <div className="h-[300px] md:h-[400px]">
          <Bar data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </Card>

      <Card className="p-4 md:p-6 mt-6">
        <h3 className="text-xl md:text-2xl font-semibold mb-4">Kategorilere Göre Soru Sayısı</h3>
        <ul className="space-y-2 md:space-y-3">
          {data.data.questionsCountByCategory.map(category => (
            <li key={category.categoryId} className="flex justify-between p-2 md:p-3 border-b text-sm md:text-base">
              <span>{category.categoryName}</span>
              <span className="font-medium">{category.questionCount} Soru</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}