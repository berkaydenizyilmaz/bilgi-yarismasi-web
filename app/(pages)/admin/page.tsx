"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";

export default function AdminDashboard() {
  const { data, error } = useSWR("/api/admin/statistics", fetcher);

  if (error) return <div>İstatistikleri yüklerken bir hata oluştu: {error.message}</div>;
  if (!data) return <div>Yükleniyor...</div>;

  return (
    <div>
      <main className="p-6">
        main
      </main>
    </div>
  );
}