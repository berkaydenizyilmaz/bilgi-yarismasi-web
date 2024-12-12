"use client"

import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";

export default function AdminLogs() {
  const { data, error } = useSWR("/api/admin/logs?limit=10&offset=0", fetcher);

  if (error) return <div>Logları yüklerken bir hata oluştu: {error.message}</div>;
  if (!data) return <div>Yükleniyor...</div>;

  return (
    <div>
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">Loglar</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="border-b p-2">Seviye</th>
              <th className="border-b p-2">Mesaj</th>
              <th className="border-b p-2">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {data.data.logs.map((log:any) => (
              <tr key={log.id}>
                <td className="border-b p-2">{log.level}</td>
                <td className="border-b p-2">{log.message}</td>
                <td className="border-b p-2">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}