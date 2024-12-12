import AdminHeader from "@/components/AdminHeader";

export default function AdminUsers() {
  return (
    <div>
      <AdminHeader />
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">Kullanıcı Yönetimi</h2>
        <p>Burada kullanıcılar listelenecek ve yönetilecektir.</p>
        {/* Kullanıcı verileri buraya eklenecek */}
      </main>
    </div>
  );
}