"use client"

import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useLeaderboard } from "@/lib/hooks/useLeaderboard"
import { Trophy } from "lucide-react"

export default function LeaderboardPage() {
  const { leaderboard, isLoading, error } = useLeaderboard()

  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  // Hata durumu
  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
          QuizVerse Lider Tablosu
        </h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Mobil görünüm için kart tasarımı */}
          <div className="md:hidden">
            {leaderboard.map((entry, index) => (
              <div 
                key={entry.username} 
                className="p-4 border-b last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center">
                      {index < 3 ? (
                        <Trophy className={`h-5 w-5 ${
                          index === 0 ? "text-yellow-500" :
                          index === 1 ? "text-gray-500" :
                          "text-yellow-800"
                        }`} />
                      ) : (
                        <span className="text-gray-600 font-medium w-5">
                          {entry.leaderboard.rank}
                        </span>
                      )}
                    </span>
                    <span className="font-medium">{entry.username}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-orange-600">{entry.total_score} puan</div>
                    <div className="text-sm text-gray-500">{entry.total_play_count} quiz</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Masaüstü görünüm için tablo tasarımı */}
          <table className="hidden md:table min-w-full">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sıra</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kullanıcı</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Toplam Puan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quiz Sayısı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <tr key={entry.username} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {index < 3 ? (
                      <Trophy className={`inline h-5 w-5 ${
                        index === 0 ? "text-yellow-500" :
                        index === 1 ? "text-gray-500" :
                        "text-yellow-800"
                      }`} />
                    ) : (
                      <span className="ml-1">
                        {entry.leaderboard.rank}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {entry.username}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {entry.total_score}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {entry.total_play_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}