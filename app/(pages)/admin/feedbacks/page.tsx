"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Mail, User, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import useSWR from "swr"
import { Feedback } from "@/types/feedback"

// Sabit değerler
const PAGE_SIZE = 15

// API yanıt tipi
interface FeedbackResponse {
  success: boolean
  data: {
    feedback: Feedback[]
    totalFeedback: number
  }
}

// Tablo başlıkları için tip tanımı
type TableHeader = {
  key: 'date' | 'name' | 'email' | 'message'
  label: string
  width?: string
}

// Tablo başlıkları
const TABLE_HEADERS: TableHeader[] = [
  { key: 'date', label: 'Tarih', width: 'w-[100px] md:w-[140px]' },
  { key: 'name', label: 'İsim', width: 'w-[120px]' },
  { key: 'email', label: 'E-posta', width: 'w-[140px]' },
  { key: 'message', label: 'Mesaj' },
] as const

// Feedback satırı bileşeni - Performans için memoize edildi
const FeedbackRow = React.memo(({ feedback }: { feedback: Feedback }) => (
  <TableRow className="hover:bg-orange-50/50 transition-colors">
    <TableCell className="whitespace-nowrap">
      <div className="text-gray-600 text-sm">
        <span className="hidden md:inline">
          {format(new Date(feedback.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
        </span>
        <span className="md:hidden">
          {format(new Date(feedback.createdAt), 'dd MMM HH:mm', { locale: tr })}
        </span>
      </div>
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-1 text-sm">
        <User className="w-3 h-3 text-gray-400 hidden md:inline" />
        <span className="truncate max-w-[100px]" title={feedback.name}>
          {feedback.name}
        </span>
      </div>
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-1 text-sm">
        <Mail className="w-3 h-3 text-gray-400 hidden md:inline" />
        <a 
          href={`mailto:${feedback.email}`}
          className="text-orange-600 hover:text-orange-700 transition-colors truncate max-w-[120px]"
          title={feedback.email}
        >
          {feedback.email}
        </a>
      </div>
    </TableCell>
    <TableCell className="whitespace-normal break-words">
      <div className="flex items-start gap-1">
        <MessageSquare className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0 hidden md:inline" />
        <p className="text-gray-700 text-sm line-clamp-2">
          {feedback.message}
        </p>
      </div>
    </TableCell>
  </TableRow>
))

// Sayfalama bileşeni
const Pagination = React.memo(({ 
  page, 
  totalPages, 
  onPageChange 
}: { 
  page: number
  totalPages: number
  onPageChange: (newPage: number) => void
}) => (
  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-100">
    <div className="flex gap-2 w-full sm:w-auto">
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex-1 sm:flex-none hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-2" /> Önceki
      </Button>
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex-1 sm:flex-none hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
      >
        Sonraki <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
    <span className="text-gray-600 font-medium order-first sm:order-none w-full sm:w-auto text-center">
      Sayfa {page} / {totalPages}
    </span>
  </div>
))

// Ana bileşen
export default function FeedbacksPage() {
  const [page, setPage] = useState(1)

  // SWR ile veri çekme
  const { data, error, isLoading } = useSWR<FeedbackResponse>(
    `/api/admin/feedbacks?limit=${PAGE_SIZE}&offset=${(page - 1) * PAGE_SIZE}`,
    async (url: string) => {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Geri bildirimler yüklenemedi')
      return response.json()
    }
  )

  // Toplam sayfa sayısını hesapla
  const totalPages = Math.ceil((data?.data.totalFeedback || 0) / PAGE_SIZE)

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8 px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto"
        >
          <Card className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-0">
            <div className="text-center text-red-500">
              Geri bildirimler yüklenirken bir hata oluştu
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  const feedbacks = data?.data.feedback || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full px-2 sm:px-4 mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-4 md:p-8"
        >
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              Geri Bildirimler
            </h1>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    {TABLE_HEADERS.map(header => (
                      <TableHead 
                        key={header.key}
                        className={`font-semibold ${header.width || ''}`}
                      >
                        {header.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map(feedback => (
                    <FeedbackRow key={feedback.id} feedback={feedback} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination 
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}