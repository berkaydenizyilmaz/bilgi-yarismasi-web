"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Trophy } from "lucide-react"

interface LeaderboardEntry {
  username: string
  total_score: number
  quiz_count: number
  average_score: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Lider tablosu alınamadı")
        }

        setLeaderboard(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

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
        <h1 className="text-3xl font-bold text-center mb-8">
          QuizVerse Lider Tablosu
        </h1>

        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {index < 3 ? (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Trophy className={`w-6 h-6 ${
                        index === 0 ? "text-yellow-500" :
                        index === 1 ? "text-gray-400" :
                        "text-orange-600"
                      }`} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center text-gray-500 font-semibold">
                      {index + 1}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{entry.username}</p>
                    <p className="text-sm text-gray-500">
                      {entry.quiz_count} Quiz Tamamlandı
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">
                    {entry.total_score} Puan
                  </p>
                  <p className="text-sm text-gray-500">
                    Ort. %{Math.round(Number(entry.average_score))}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}