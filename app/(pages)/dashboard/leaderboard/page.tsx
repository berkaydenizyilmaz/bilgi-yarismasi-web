"use client"

import { useLeaderboard } from "@/lib/hooks/useLeaderboard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Trophy, Medal, Star } from "lucide-react"
import { motion } from "framer-motion"
import { LeaderboardEntry } from "@/types/leaderboard"

export default function LeaderboardPage() {
  const { leaderboard, isLoading, error } = useLeaderboard()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
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

  // Animasyon varyantları sadeleştirildi
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate="show"
        variants={container}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-12">
          Lider Tablosu
        </h1>

        <div className="space-y-4">
          {leaderboard?.map((entry: LeaderboardEntry) => (
            <motion.div
              key={entry.username}
              variants={item}
              className="relative rounded-xl border p-4 md:p-6 bg-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-50">
                    {entry.leaderboard.rank <= 3 ? getRankIcon(entry.leaderboard.rank) : 
                      <span className="text-xl font-bold text-orange-600">
                        {entry.leaderboard.rank}
                      </span>
                    }
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                      {entry.username}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {entry.total_play_count} quiz tamamlandı
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                    {entry.total_score}
                  </div>
                  <div className="text-sm text-gray-500">puan</div>
                </div>
              </div>
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-orange-500 to-orange-300 rounded-full" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-yellow-500" />
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />
    case 3:
      return <Star className="h-6 w-6 text-orange-500" />
    default:
      return null
  }
}