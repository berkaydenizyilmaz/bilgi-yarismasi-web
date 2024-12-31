"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/swr-config"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"
import { Feedback } from "@/types/feedback";

interface FeedbackData {
  feedback: Feedback[]
  totalFeedback: number
}

export default function AdminFeedback() {
  // Sayfalama için state ve sabitleri tanımla
  const [page, setPage] = useState(1)
  const pageSize = 10

  // SWR ile veri çekme
  const { data, error, isLoading } = useSWR<{ 
    success: boolean
    message: string
    data: FeedbackData 
  }>(`/api/admin/feedbacks?limit=${pageSize}&offset=${(page - 1) * pageSize}`, fetcher)

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
      <div className="text-center p-4 md:p-6">
        <p className="text-red-500 text-sm md:text-base">
          Geri bildirimler yüklenirken bir hata oluştu
        </p>
      </div>
    )
  }

  // Veriyi hazırla
  const feedbacks = data?.data?.feedback || []
  const totalFeedbacks = data?.data?.totalFeedback || 0

  // Veri boş ise
  if (feedbacks.length === 0) {
    return (
      <div className="p-4 md:p-6 min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <MessageSquare className="mx-auto mb-4 h-12 md:h-16 w-12 md:w-16 text-gray-400" />
          <p className="text-lg md:text-xl text-gray-600">Henüz geri bildirim yok.</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(totalFeedbacks / pageSize)

  // Ana içerik
  return (
    <div className="bg-orange-50 min-h-screen py-6 md:py-10">
      <main className="max-w-7xl mx-auto px-4">
        <Card className="overflow-hidden">
          {/* Başlık alanı */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 md:p-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="h-6 md:h-8 w-6 md:w-8" />
              Kullanıcı Geri Bildirimleri
            </h2>
          </div>

          {/* Geri bildirim listesi */}
          <div className="divide-y">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="p-4 md:p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-base md:text-lg">
                    {feedback.name}
                  </h3>
                  <span className="text-xs md:text-sm text-gray-500">
                    {new Date(feedback.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm md:text-base">
                  {feedback.message}
                </p>
                <div className="mt-2 text-xs md:text-sm text-gray-500">
                  {feedback.email}
                </div>
              </div>
            ))}
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="bg-white p-4 md:p-6 flex justify-between items-center border-t">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="text-sm md:text-base flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Önceki
              </Button>
              <span className="text-sm md:text-base text-gray-600">
                Sayfa {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="text-sm md:text-base flex items-center gap-2"
              >
                Sonraki <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}