"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/lib/hooks/use-toast"
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

interface Log {
  id: number
  level: string
  module: string
  action: string
  message: string
  timestamp: string
  path?: string
  user_id?: number
  username?: string
  error?: any
  metadata?: any
}

interface Log {
  id: number
  level: string
  module: string
  action: string
  message: string
  timestamp: string
  path?: string
  user_id?: number
  username?: string
  error?: any
  metadata?: any
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10
  const { toast } = useToast()

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/admin/logs?page=${page}&pageSize=${pageSize}`)
        const data = await response.json()

        console.log('API Response:', data);

        if (data.success) {
          setLogs(data.data.logs || []);
          setTotalPages(Math.ceil((data.data.total || 0) / pageSize));
        } else {
          throw new Error(data.error?.message || "Loglar yüklenemedi");
        }
      } catch (error) {
        console.error('Log yükleme hatası:', error);
        toast({
          title: "Hata",
          description: "Loglar yüklenirken bir hata oluştu",
          variant: "destructive"
        });
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [page, pageSize, toast]);

  // Metadata'yı daha okunabilir formatta göster
  const formatMetadata = (metadata: any) => {
    if (!metadata) return null

    return Object.entries(metadata).map(([key, value]) => (
      <div key={key} className="mb-1">
        <span className="font-medium text-gray-700">{key}:</span>{" "}
        <span className="text-gray-600">
          {typeof value === 'object' ? JSON.stringify(value) : value?.toString()}
        </span>
      </div>
    ))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Sistem Logları</h1>
          </div>
          <div className="text-center text-gray-500">
            Henüz log kaydı bulunmamaktadır.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sistem Logları</h1>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Seviye</TableHead>
              <TableHead>Modül</TableHead>
              <TableHead>İşlem</TableHead>
              <TableHead>Mesaj</TableHead>
              <TableHead>Detaylar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs && logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss', { locale: tr })}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.level === 'error' ? 'bg-red-100 text-red-800' :
                    log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {log.username && <div className="mb-1">Kullanıcı: {log.username}</div>}
                    {formatMetadata(log.metadata)}
                    {log.error && (
                      <div className="text-red-600">
                        Hata: {typeof log.error === 'object' ? JSON.stringify(log.error) : log.error}
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

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
      </Card>
    </div>
  )
}