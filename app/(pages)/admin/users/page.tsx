"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { useState } from "react";

export default function AdminUsers() {
  const { data, error, mutate } = useSWR("/api/admin/users", fetcher);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user"); // Varsayılan rol

  const handleDelete = async (userId: number) => {
    if (confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
      await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });
      mutate(); // Veriyi yeniden yükle
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role); // Kullanıcının mevcut rolünü ayarla
  };

  const handleUpdate = async () => {
    await fetch(`/api/admin/users?id=${editingUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, role }), // Rolü de gönder
    });
    setEditingUser(null);
    mutate(); // Veriyi yeniden yükle
  };

  if (error) return <div>Kullanıcıları yüklerken bir hata oluştu: {error.message}</div>;
  if (!data) return <div>Yükleniyor...</div>;

  return (
    <div>
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">Kullanıcı Yönetimi</h2>
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="border-b p-2">Kullanıcı Adı</th>
              <th className="border-b p-2">Email</th>
              <th className="border-b p-2">Rol</th>
              <th className="border-b p-2">Kayıt Tarihi</th>
              <th className="border-b p-2">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {data.data.users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-100">
                <td className="border-b p-2">
                  {editingUser?.id === user.id ? (
                    <input
                      className="border rounded p-1"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td className="border-b p-2">
                  {editingUser?.id === user.id ? (
                    <input
                      className="border rounded p-1"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="border-b p-2">
                  {editingUser?.id === user.id ? (
                    <select
                      className="border rounded p-1"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="user">Kullanıcı</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td className="border-b p-2">{new Date(user.created_at).toLocaleString()}</td>
                <td className="border-b p-2">
                  {editingUser?.id === user.id ? (
                    <>
                      <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={handleUpdate}>Kaydet</button>
                      <button className="bg-red-500 text-white px-3 py-1 rounded ml-2" onClick={() => setEditingUser(null)}>İptal</button>
                    </>
                  ) : (
                    <>
                      <button className="text-blue-500" onClick={() => handleEdit(user)}>Güncelle</button>
                      <button className="text-red-500 ml-4" onClick={() => handleDelete(user.id)}>Sil</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}