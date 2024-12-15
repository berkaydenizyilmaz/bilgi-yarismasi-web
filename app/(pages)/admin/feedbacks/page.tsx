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
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

export default function AdminFeedback() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR(
    `/api/admin/feedbacks?limit=15&offset=${(page - 1) * 15}`,
    fetcher
  );

  if (error) {
    return (
      <div className="p-6 bg-red-50 min-h-screen flex flex-col justify-center items-center">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          <p className="text-red-500 text-center mb-4">
            Geri bildirimleri yüklerken bir hata oluştu: {error.message}
          </p>
          <Link
            href="/admin"
            className="w-full block text-center bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded transition-colors"
          >
            Admin Paneline Dön
          </Link>
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

  if (!data || !data.data || !data.data.feedback) {
    return (
      <div className="p-6 min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <MessageCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="text-xl text-gray-600">Henüz geri bildirim yok.</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(data.data.totalFeedback / 15);
  const feedbackData = data.data.feedback || [];

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <main className="max-w-7xl mx-auto px-4">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <MessageCircle className="h-8 w-8" />
              Geri Bildirimler
            </h2>
          </div>

          <Table className="w-full">
            <TableCaption className="bg-gray-50 p-2 text-gray-600">
              Toplam {data.data.totalFeedback} geri bildirimden {feedbackData.length} tanesi
            </TableCaption>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-1/6">İsim</TableHead>
                <TableHead className="w-1/6">Email</TableHead>
                <TableHead className="w-3/6">Mesaj</TableHead>
                <TableHead className="w-1/6">Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbackData.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-700">{item.name}</TableCell>
                  <TableCell className="text-gray-600">{item.email}</TableCell>
                  <TableCell className="break-words max-w-xs overflow-hidden text-ellipsis text-gray-800">
                    {item.message}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(item.createdAt).toLocaleString()}
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