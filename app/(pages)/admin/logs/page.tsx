"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/swr-config"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertCircle, Bug, Info, FileText, ChevronLeft, ChevronRight } from "lucide-react"

// Tip tanımlamaları
interface Log {
  id: number
  level: string
  message: string
  timestamp: string
}

interface LogsResponse {
  success: boolean
  data: {
    logs: Log[]
  }
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function AdminLogs() {
  const [page, setPage] = useState(1)
  const pageSize = 15

  const { data, error, isLoading } = useSWR<LogsResponse>(
    `/api/admin/logs?page=${page}&limit=${pageSize}`,
    fetcher
  )

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warn':
        return <Bug className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
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
      <div className="p-4 md:p-6 bg-red-50 min-h-screen flex flex-col justify-center items-center">
        <Card className="p-6 md:p-8 max-w-md w-full">
          <p className="text-red-500 text-center text-sm md:text-base mb-4">
            Logları yüklerken bir hata oluştu: {error.message}
          </p>
        </Card>
      </div>
    )
  }

  if (!data?.data?.logs) {
    return (
      <div className="p-4 md:p-6 min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <FileText className="mx-auto mb-4 h-12 md:h-16 w-12 md:w-16 text-gray-400" />
          <p className="text-lg md:text-xl text-gray-600">Henüz log kaydı yok.</p>
        </div>
      </div>
    )
  }

  const totalPages = data.pagination.totalPages
  const logsData = data.data.logs
  const totalLogs = data.pagination.total

  return (
    <div className="bg-orange-50 min-h-screen py-6 md:py-10">
      <main className="max-w-7xl mx-auto px-4">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 md:p-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="h-6 md:h-8 w-6 md:w-8" />
              Sistem Logları
            </h2>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableCaption className="bg-gray-50 p-2 text-sm md:text-base text-gray-600">
                Toplam {totalLogs} log kaydından {logsData.length} tanesi
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/6 text-sm md:text-base">Seviye</TableHead>
                  <TableHead className="w-3/6 text-sm md:text-base">Mesaj</TableHead>
                  <TableHead className="w-1/6 text-sm md:text-base">Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsData.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="flex items-center gap-2 text-sm md:text-base">
                      {getLevelIcon(log.level)}
                      <span className="font-medium">{log.level}</span>
                    </TableCell>
                    <TableCell className="break-words max-w-xs text-sm md:text-base">
                      {log.message}
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs md:text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="bg-white p-4 flex justify-between items-center border-t">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="text-sm md:text-base"
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Önceki
              </Button>
              <span className="text-sm md:text-base text-gray-600">
                Sayfa {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="text-sm md:text-base"
              >
                Sonraki <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}