"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
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

interface Feedback {
  id: number
  name: string
  email: string
  message: string
  createdAt: string
}

interface FeedbackData {
  feedback: Feedback[]
  totalFeedback: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function FeedbacksPage() {
  const [page, setPage] = useState(1)
  const pageSize = 15

  const { data, error, isLoading } = useSWR<{ 
    success: boolean
    data: FeedbackData 
  }>(`/api/admin/feedbacks?limit=${pageSize}&offset=${(page - 1) * pageSize}`, fetcher)

  const totalPages = Math.ceil((data?.data.totalFeedback || 0) / pageSize)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center text-red-500">
            Geri bildirimler yüklenirken bir hata oluştu
          </div>
        </Card>
      </div>
    )
  }

  const feedbacks = data?.data.feedback || []

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Geri Bildirimler</h1>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Tarih</TableHead>
              <TableHead className="w-32">İsim</TableHead>
              <TableHead className="w-48">E-posta</TableHead>
              <TableHead>Mesaj</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell>
                  {format(new Date(feedback.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                </TableCell>
                <TableCell>{feedback.name}</TableCell>
                <TableCell>{feedback.email}</TableCell>
                <TableCell className="whitespace-normal break-words max-w-xl">
                  {feedback.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Önceki
            </Button>
            <span>
              Sayfa {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sonraki <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}