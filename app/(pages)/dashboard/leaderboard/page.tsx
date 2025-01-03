"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useLeaderboard } from "@/lib/hooks/useLeaderboard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Trophy, Medal, Star, Crown, Award, 
  Sparkles, ChevronLeft, ChevronRight 
} from "lucide-react"
import { LeaderboardEntry } from "@/types/leaderboard"

// Sabit değerler
const ITEMS_PER_PAGE = 10

// Tip tanımlamaları
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

interface LeaderboardItemProps {
  entry: LeaderboardEntry
  index: number
}

// Animasyon varyantları
const animations = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  item: {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  },
  header: {
    hidden: { opacity: 0, y: -20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }
}

export default function LeaderboardPage() {
  // State ve hook yönetimi
  const { leaderboard, isLoading, error } = useLeaderboard()
  const [currentPage, setCurrentPage] = useState(1)

  // Sayfalama hesaplamaları
  const totalPages = Math.ceil((leaderboard?.length || 0) / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentItems = leaderboard?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || []

  // Sayfa değiştirme işleyicisi
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 py-8 sm:py-12 px-4">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate="show"
        variants={animations.container}
      >
        <LeaderboardHeader />
        <LeaderboardList items={currentItems} />
        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <TotalUsersCount count={leaderboard?.length || 0} />
      </motion.div>
    </div>
  )
}

// Alt Bileşenler
function LeaderboardHeader() {
  return (
    <motion.div 
      className="text-center mb-12"
      variants={animations.header}
    >
      <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4">
        <Trophy className="w-8 h-8 text-orange-600" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-400 bg-clip-text text-transparent">
        Lider Tablosu
      </h1>
      <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
        En yüksek puanları toplayan oyuncuların sıralaması
      </p>
    </motion.div>
  )
}

function LeaderboardList({ items }: { items: LeaderboardEntry[] }) {
  return (
    <div className="space-y-4 mb-8">
      {items.map((entry, index) => (
        <LeaderboardItem 
          key={entry.username} 
          entry={entry} 
          index={index}
        />
      ))}
    </div>
  )
}

function LeaderboardItem({ entry, index }: LeaderboardItemProps) {
  return (
    <motion.div variants={animations.item} className="group">
      <Card className={`relative overflow-hidden transition-all duration-300
        ${index < 3 ? 'border-2' : 'border'}
        ${index === 0 ? 'border-yellow-400 shadow-yellow-100' : ''}
        ${index === 1 ? 'border-gray-300 shadow-gray-100' : ''}
        ${index === 2 ? 'border-orange-300 shadow-orange-100' : ''}
        hover:shadow-lg hover:scale-[1.01]`}
      >
        <LeaderboardItemContent entry={entry} index={index} />
        <RankIndicator index={index} />
      </Card>
    </motion.div>
  )
}

function LeaderboardItemContent({ entry, index }: LeaderboardItemProps) {
  return (
    <div className="relative p-4 md:p-6">
      <div className="flex items-center justify-between">
        <UserInfo entry={entry} index={index} />
        <ScoreInfo entry={entry} />
      </div>
    </div>
  )
}

function UserInfo({ entry, index }: LeaderboardItemProps) {
  return (
    <div className="flex items-center gap-4">
      <RankBadge rank={entry.leaderboard.rank} index={index} />
      <div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-2">
          {entry.username}
          {index === 0 && <TopPlayerCrown />}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Award className="h-4 w-4" />
          <span>{entry.total_play_count} quiz tamamlandı</span>
        </div>
      </div>
    </div>
  )
}

function RankBadge({ rank, index }: { rank: number, index: number }) {
  return (
    <div className={`flex items-center justify-center w-12 h-12 rounded-full
      transition-all duration-300 group-hover:scale-110
      ${index === 0 ? 'bg-yellow-100' : ''}
      ${index === 1 ? 'bg-gray-100' : ''}
      ${index === 2 ? 'bg-orange-100' : ''}
      ${index > 2 ? 'bg-orange-50' : ''}`}
    >
      {rank <= 3 ? (
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          {getRankIcon(rank)}
        </motion.div>
      ) : (
        <span className="text-xl font-bold text-orange-600">
          {rank}
        </span>
      )}
    </div>
  )
}

function ScoreInfo({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="text-right">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-orange-500" />
        <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r 
          from-orange-600 to-red-400 bg-clip-text text-transparent">
          {entry.total_score}
        </span>
      </div>
      <div className="text-sm text-gray-500">toplam puan</div>
    </div>
  )
}

function TopPlayerCrown() {
  return (
    <motion.div
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <Crown className="h-5 w-5 text-yellow-500" />
    </motion.div>
  )
}

function RankIndicator({ index }: { index: number }) {
  return (
    <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-12 rounded-full
      ${index === 0 ? 'bg-gradient-to-b from-yellow-400 to-orange-400' : ''}
      ${index === 1 ? 'bg-gradient-to-b from-gray-400 to-gray-300' : ''}
      ${index === 2 ? 'bg-gradient-to-b from-orange-500 to-orange-300' : ''}
      ${index > 2 ? 'bg-gradient-to-b from-orange-400 to-orange-200' : ''}`}
    />
  )
}

function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <motion.div 
      className="flex items-center justify-center gap-4 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 hover:bg-orange-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Önceki
      </Button>

      <PageNumbers 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={onPageChange} 
      />

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 hover:bg-orange-50"
      >
        Sonraki
        <ChevronRight className="w-4 h-4" />
      </Button>
    </motion.div>
  )
}

function PageNumbers({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <Button
          key={pageNum}
          variant={pageNum === currentPage ? "default" : "outline"}
          onClick={() => onPageChange(pageNum)}
          className={`w-10 h-10 p-0 ${
            pageNum === currentPage 
              ? 'bg-gradient-to-r from-orange-600 to-red-500 text-white' 
              : 'hover:bg-orange-50'
          }`}
        >
          {pageNum}
        </Button>
      ))}
    </div>
  )
}

function TotalUsersCount({ count }: { count: number }) {
  return (
    <motion.div
      className="text-center mt-6 text-sm text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      Toplam {count} kullanıcı
    </motion.div>
  )
}

// Yardımcı fonksiyonlar
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