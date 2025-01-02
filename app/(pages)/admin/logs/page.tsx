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
import { Log } from "@/types/log";

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
      <div key={key} className="mb-1 break-words">
        <span className="font-medium text-gray-700">{key}:</span>{" "}
        <span className="text-gray-600">
          {typeof value === 'object' ? JSON.stringify(value, null, 2) : value?.toString()}
        </span>
      </div>
    ))
  }

  // Mobil görünüm için kart formatında log gösterimi
  const renderMobileLog = (log: Log) => (
    <div key={log.id} className="bg-white p-4 rounded-lg shadow-sm mb-4 border">
      <div className="flex justify-between items-start mb-2">
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          log.level === 'error' ? 'bg-red-100 text-red-800' :
          log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {log.level.toUpperCase()}
        </span>
        <span className="text-xs text-gray-500">
          {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss', { locale: tr })}
        </span>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-600">Modül:</span>
          <span className="text-sm ml-2">{log.module}</span>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-600">İşlem:</span>
          <span className="text-sm ml-2">{log.action}</span>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-600">Mesaj:</span>
          <div className="text-sm mt-1">{log.message}</div>
        </div>

        {(log.username || log.metadata || log.error) && (
          <div className="mt-3 pt-3 border-t">
            {log.username && (
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">Kullanıcı:</span>
                <span className="text-sm ml-2">{log.username}</span>
              </div>
            )}
            
            {log.metadata && (
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">Detaylar:</span>
                <div className="mt-1 text-sm">{formatMetadata(log.metadata)}</div>
              </div>
            )}
            
            {log.error && (
              <div>
                <span className="text-sm font-medium text-red-600">Hata:</span>
                <div className="mt-1 text-sm text-red-600 break-words">
                  {typeof log.error === 'object' ? JSON.stringify(log.error, null, 2) : log.error}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

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
        <Card className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl md:text-2xl font-bold">Sistem Logları</h1>
          </div>
          <div className="text-center text-gray-500">
            Henüz log kaydı bulunmamaktadır.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <Card className="p-3 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold">Sistem Logları</h1>
        </div>

        {/* Masaüstü görünümü */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Tarih</TableHead>
                <TableHead className="whitespace-nowrap">Seviye</TableHead>
                <TableHead className="whitespace-nowrap">Modül</TableHead>
                <TableHead className="whitespace-nowrap">İşlem</TableHead>
                <TableHead className="whitespace-nowrap">Mesaj</TableHead>
                <TableHead className="whitespace-nowrap">Detaylar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs && logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-gray-50">
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss', { locale: tr })}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      log.level === 'error' ? 'bg-red-100 text-red-800' :
                      log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.level.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{log.module}</TableCell>
                  <TableCell className="text-sm">{log.action}</TableCell>
                  <TableCell className="text-sm max-w-[200px] md:max-w-[300px] truncate">
                    {log.message}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-[200px] md:max-w-[300px] break-words">
                      {log.username && (
                        <div className="mb-1 font-medium">
                          Kullanıcı: <span className="font-normal">{log.username}</span>
                        </div>
                      )}
                      {formatMetadata(log.metadata)}
                      {log.error && (
                        <div className="text-red-600 break-words">
                          Hata: {typeof log.error === 'object' ? JSON.stringify(log.error, null, 2) : log.error}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobil görünümü */}
        <div className="md:hidden">
          {logs.map(renderMobileLog)}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Önceki
          </Button>
          <span className="text-sm text-gray-600">
            Sayfa {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-full sm:w-auto"
          >
            Sonraki <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  )
}