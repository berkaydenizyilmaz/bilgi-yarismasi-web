"use client"

import React, { useEffect, useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/swr-config"
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Users, MessageSquare, BarChart3, ClipboardList, FileText } from "lucide-react"
import { motion } from "framer-motion"

// Chart.js bileşenlerini kaydet
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Veri tipleri
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

// İstatistik kartı bileşeni - Performans için memoize edildi
const StatCard = React.memo(({ 
  title, 
  value, 
  icon, 
  gradient 
}: { 
  title: string
  value: number
  icon: React.ReactNode
  gradient: string 
}) => (
  <Card className="relative bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl border-0 overflow-hidden group hover:shadow-2xl transition-all duration-300">
    <div className="relative z-10">
      <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
        <div className="p-2 md:p-3 rounded-xl bg-gray-50 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-sm md:text-base text-gray-600">{title}</h3>
      </div>
      <p className={`text-xl md:text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value.toLocaleString()}
      </p>
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </Card>
))

// Chart wrapper bileşeni
const ResponsiveChart = React.memo(({ data, options }: { data: any, options: any }) => {
  const [key, setKey] = useState(0)

  useEffect(() => {
    // Pencere boyutu değiştiğinde Chart'ı yeniden render et
    const handleResize = () => {
      setKey(prev => prev + 1)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <Bar key={key} data={data} options={options} />
})

// Grafik seçenekleri - Performans için dışarıda tanımlandı
const baseChartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  resizeDelay: 0, // Yeniden boyutlandırma gecikmesini kaldır
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  },
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Günlük Quiz İstatistikleri'
    }
  }
}

export default function AdminStatistics() {
  // SWR ile veri çekme
  const { data, error, isLoading } = useSWR<{ data: StatisticsData }>('/api/admin/statistics', fetcher)

  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  // Hata durumu
  if (error || !data) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Veriler alınamadı</p>
      </div>
    )
  }

  // Grafik verilerini hazırla
  const sortedQuizData = [...data.data.quizzesCountByDate, {
    date: new Date().toISOString().split('T')[0],
    count: 0
  }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const chartData = {
    labels: sortedQuizData.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('tr-TR', { 
        day: 'numeric',
        month: 'short'
      })
    }),
    datasets: [{
      label: 'Günlük Quiz Sayısı',
      data: sortedQuizData.map(item => item.count),
      backgroundColor: 'rgba(249, 115, 22, 0.5)',
      borderColor: 'rgb(249, 115, 22)',
      borderWidth: 1,
    }],
  }

  // Responsive grafik seçenekleri
  const responsiveChartOptions = {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      legend: {
        ...baseChartOptions.plugins.legend,
        labels: {
          font: {
            size: window.innerWidth < 768 ? 12 : 14
          }
        }
      }
    },
    scales: {
      ...baseChartOptions.scales,
      y: {
        ...baseChartOptions.scales.y,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      },
      x: {
        ...baseChartOptions.scales.x,
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8 px-4 lg:py-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Başlık */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent"
        >
          Admin İstatistikleri
        </motion.h1>

        {/* İstatistik Kartları */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8"
        >
          <StatCard 
            title="Toplam Kullanıcı" 
            value={data.data.totalUsers} 
            icon={<Users className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />}
            gradient="from-blue-500 to-blue-400"
          />
          <StatCard 
            title="Toplam Quiz" 
            value={data.data.totalQuizzes} 
            icon={<ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-green-500" />}
            gradient="from-green-500 to-green-400"
          />
          <StatCard 
            title="Toplam Soru" 
            value={data.data.totalQuestions} 
            icon={<MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />}
            gradient="from-purple-500 to-purple-400"
          />
          <StatCard 
            title="Geri Bildirim" 
            value={data.data.totalFeedback} 
            icon={<FileText className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />}
            gradient="from-yellow-500 to-yellow-400"
          />
          <StatCard 
            title="Toplam Log" 
            value={data.data.totalLogs} 
            icon={<BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />}
            gradient="from-orange-500 to-orange-400"
          />
        </motion.div>

        {/* Grafik */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm p-4 md:p-8 rounded-2xl shadow-xl border-0 mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              Tarihe Göre Quiz İstatistikleri
            </h3>
            <div className="h-[300px] md:h-[400px]">
              <ResponsiveChart data={chartData} options={responsiveChartOptions} />
            </div>
          </Card>
        </motion.div>

        {/* Kategori İstatistikleri */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm p-4 md:p-8 rounded-2xl shadow-xl border-0">
            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              Kategorilere Göre Soru Dağılımı
            </h3>
            <div className="grid gap-3 md:gap-4">
              {data.data.questionsCountByCategory.map(category => (
                <div 
                  key={category.categoryId} 
                  className="p-3 md:p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      <span className="font-medium text-gray-700 text-sm md:text-base">
                        {category.categoryName}
                      </span>
                    </div>
                    <span className="text-base md:text-lg font-semibold text-orange-600">
                      {category.questionCount} Soru
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}