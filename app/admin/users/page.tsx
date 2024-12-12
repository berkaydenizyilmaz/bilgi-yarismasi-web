"use client";

import AdminHeader from "@/components/AdminHeader";
import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";

export default function AdminUsers() {
  const { data, error } = useSWR("/api/admin/users", fetcher);

  if (error) return <div>Kullanıcıları yüklerken bir hata oluştu: {error.message}</div>;
  if (!data) return <div>Yükleniyor...</div>;

  return (
    <div>
      <AdminHeader />
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">Kullanıcı Yönetimi</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="border-b p-2">Kullanıcı Adı</th>
              <th className="border-b p-2">Email</th>
              <th className="border-b p-2">Rol</th>
              <th className="border-b p-2">Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {data.data.users.map((user: any) => (
              <tr key={user.id}>
                <td className="border-b p-2">{user.username}</td>
                <td className="border-b p-2">{user.email}</td>
                <td className="border-b p-2">{user.role}</td>
                <td className="border-b p-2">{new Date(user.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}