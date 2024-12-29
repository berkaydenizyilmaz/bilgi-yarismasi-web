"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { BarChart, User, MessageCircle, FileText } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";

export default function AdminStatistics() {
  const { data, error } = useSWR("/api/admin/statistics", fetcher);

  if (error) return <div>İstatistikleri yüklerken bir hata oluştu: {error.message}</div>;
  if (!data) return <div className="flex justify-center items-center h-screen"><LoadingSpinner className="h-10 w-10" /></div>; // Boyut küçültüldü

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">İstatistikler</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center p-4 bg-blue-100">
          <User className="h-8 w-8 text-blue-600 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Toplam Kullanıcı</h3>
            <p className="text-2xl">{data.data.totalUsers}</p>
          </div>
        </Card>
        <Card className="flex items-center p-4 bg-green-100">
          <MessageCircle className="h-8 w-8 text-green-600 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Toplam Geri Bildirim</h3>
            <p className="text-2xl">{data.data.totalFeedback}</p>
          </div>
        </Card>
        <Card className="flex items-center p-4 bg-yellow-100">
          <FileText className="h-8 w-8 text-yellow-600 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Toplam Log</h3>
            <p className="text-2xl">{data.data.totalLogs}</p>
          </div>
        </Card>
      </div>
      {/* Burada grafik bileşenleri eklenebilir */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Grafikler</h3>
        {/* Örnek grafik bileşeni */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <BarChart className="h-48 w-full" />
          <p className="text-center">Grafik verileri burada gösterilecek.</p>
        </div>
      </div>
    </div>
  );
}