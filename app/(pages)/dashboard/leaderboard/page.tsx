"use client"

import { useLeaderboard } from "@/lib/hooks/useLeaderboard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Trophy, Medal, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LeaderboardEntry } from "@/types/leaderboard"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const ITEMS_PER_PAGE = 10

export default function LeaderboardPage() {
  const { leaderboard, isLoading, error } = useLeaderboard()
  const [currentPage, setCurrentPage] = useState(1)

  // Toplam sayfa sayısını hesapla
  const totalPages = Math.ceil((leaderboard?.length || 0) / ITEMS_PER_PAGE)
  
  // Mevcut sayfada gösterilecek verileri hesapla
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return leaderboard?.slice(startIndex, endIndex) || []
  }

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />
      default:
        return <Star className="h-5 w-5 text-gray-400" />
    }
  }

  const getCardStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20"
      case 2:
        return "bg-gradient-to-r from-gray-200/30 to-gray-100/30 border-gray-200/40"
      case 3:
        return "bg-gradient-to-r from-amber-700/10 to-amber-600/10 border-amber-700/20"
      default:
        return "bg-white hover:bg-orange-50/50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Başlık */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-4"
          >
            Lider Tablosu
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600"
          >
            En iyi oyuncular ve skorları
          </motion.p>
        </div>

        {/* Liderlik Tablosu */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            {getCurrentPageData().map((entry: LeaderboardEntry) => (
              <motion.div
                key={entry.username}
                variants={item}
                className={`
                  relative rounded-xl border p-4 md:p-6
                  transition-all duration-300 hover:shadow-md
                  ${getCardStyle(entry.leaderboard.rank)}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm">
                      {getRankIcon(entry.leaderboard.rank)}
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
                    <div className="text-sm text-gray-500">
                      puan
                    </div>
                  </div>
                </div>
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-orange-500 to-orange-300 rounded-full" />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Sayfalandırma */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 transition-all duration-200 hover:bg-orange-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 ${
                    currentPage === pageNum 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'hover:bg-orange-50'
                  }`}
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 transition-all duration-200 hover:bg-orange-50"
            >
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}