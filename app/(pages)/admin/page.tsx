"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { Bar } from 'react-chartjs-2'; // Chart.js kütüphanesi
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Chart.js bileşenlerini kaydet
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Veri yapısı tanımları
interface QuizCountByDate {
  date: string;
  count: number;
}

interface QuestionsCountByCategory {
  categoryId: number;
  categoryName: string;
  questionCount: number;
}

interface StatisticsData {
  totalUsers: number;
  totalFeedback: number;
  totalLogs: number;
  totalQuizzes: number;
  quizzesCountByDate: QuizCountByDate[];
  questionsCountByCategory: QuestionsCountByCategory[];
}

export default function AdminStatistics() {
  const { data, error } = useSWR<{ data: StatisticsData }>("/api/admin/statistics", fetcher);

  if (error) return <div>İstatistikleri yüklerken bir hata oluştu: {error.message}</div>;
  if (!data) return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;

  // Grafik verilerini hazırlama
  const chartData = {
    labels: data.data.quizzesCountByDate.map(item => item.date), // Tarih etiketleri
    datasets: [
      {
        label: 'Çözülen Quiz Sayısı',
        data: data.data.quizzesCountByDate.map(item => item.count), // Quiz sayıları
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Grafik seçenekleri
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tarih',
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10, // X eksenindeki maksimum etiket sayısı
        },
      },
      y: {
        title: {
          display: true,
          text: 'Quiz Sayısı',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">İstatistikler</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Toplam Kullanıcı</h3>
          <p className="text-2xl">{data.data.totalUsers}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Toplam Geri Bildirim</h3>
          <p className="text-2xl">{data.data.totalFeedback}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Toplam Log</h3>
          <p className="text-2xl">{data.data.totalLogs}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">Toplam Quiz</h3>
          <p className="text-2xl">{data.data.totalQuizzes}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md" style={{ height: '400px' }}>
        <h3 className="text-2xl font-semibold mb-4">Son Zamanlarda Çözülen Quiz Sayısı</h3>
        <Bar data={chartData} options={options} />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md mt-6">
        <h3 className="text-2xl font-semibold mb-4">Kategorilere Göre Soru Sayısı</h3>
        <ul>
          {data.data.questionsCountByCategory.map(category => (
            <li key={category.categoryId} className="flex justify-between p-2 border-b">
              <span>{category.categoryName}</span>
              <span>{category.questionCount} Soru</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}