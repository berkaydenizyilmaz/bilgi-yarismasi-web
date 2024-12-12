"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";

export default function AdminFeedback() {
  const { data, error } = useSWR("/api/admin/feedbacks?limit=10&offset=0", fetcher);

  if (error) return <div>Geri bildirimleri yüklerken bir hata oluştu: {error.message}</div>;
  if (!data) return <div>Yükleniyor...</div>;

  return (
    <div>
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">Geri Bildirimler</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="border-b p-2">İsim</th>
              <th className="border-b p-2">Email</th>
              <th className="border-b p-2">Mesaj</th>
              <th className="border-b p-2">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {data.data.feedback.map((item:any) => (
              <tr key={item.id}>
                <td className="border-b p-2">{item.name}</td>
                <td className="border-b p-2">{item.email}</td>
                <td className="border-b p-2">{item.message}</td>
                <td className="border-b p-2">{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}