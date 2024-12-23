"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText, AlertCircle, Info, Bug } from "lucide-react";

export default function AdminLogs() {
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const { data, error, isLoading } = useSWR(
    `/api/admin/logs?limit=${pageSize}&offset=${(page - 1) * pageSize}`,
    fetcher
  );

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warn':
        return <Bug className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 min-h-screen flex flex-col justify-center items-center">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          <p className="text-red-500 text-center mb-4">
            Logları yüklerken bir hata oluştu: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen bg-gray-100">
        <LoadingSpinner className="text-orange-500 animate-spin h-12 w-12" />
      </div>
    );
  }

  if (!data || !data.data || !data.data.logs) {
    return (
      <div className="p-6 min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="text-xl text-gray-600">Henüz log kaydı yok.</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(data.data.totalLogs / pageSize);
  const logsData = data.data.logs || [];

  return (
    <div className="bg-orange-50 min-h-screen py-10">
      <main className="max-w-7xl mx-auto px-4">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="h-8 w-8" />
              Sistem Logları
            </h2>
          </div>

          <Table className="w-full">
            <TableCaption className="bg-gray-50 p-2 text-gray-600">
              Toplam {data.data.totalLogs} log kaydından {logsData.length} tanesi
            </TableCaption>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-1/6">Seviye</TableHead>
                <TableHead className="w-3/6">Mesaj</TableHead>
                <TableHead className="w-1/6">Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsData.map((log: any) => (
                <TableRow key={log.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="flex items-center gap-2">
                    {getLevelIcon(log.level)}
                    <span className="font-medium text-gray-700">{log.level}</span>
                  </TableCell>
                  <TableCell className="break-words max-w-xs overflow-hidden text-ellipsis text-gray-800">
                    {log.message}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="bg-white p-4 flex justify-between items-center border-t">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Önceki
              </Button>
              <span className="text-gray-600">
                Sayfa {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-2"
              >
                Sonraki <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}