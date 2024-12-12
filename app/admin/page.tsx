"use client";

import AdminHeader from "@/components/AdminHeader";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";

export default function AdminDashboard() {
  const { data, error } = useSWR("/api/admin/statistics", fetcher);

  if (error) return <div>İstatistikleri yüklerken bir hata oluştu: {error.message}</div>;
  if (!data) return <div>Yükleniyor...</div>;

  return (
    <div>
      <AdminHeader />
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">İstatistikler</h2>
        <ul>
          <li>Toplam Kullanıcı: {data.data.totalUsers}</li>
          <li>Toplam Geri Bildirim: {data.data.totalFeedback}</li>
          <li>Toplam Log: {data.data.totalLogs}</li>
        </ul>
      </main>
    </div>
  );
}