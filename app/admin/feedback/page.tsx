import AdminHeader from "@/components/AdminHeader";

export default function AdminFeedback() {
  return (
    <div>
      <AdminHeader />
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">Geri Bildirimler</h2>
        <p>Burada kullanıcı geri bildirimleri görüntülenecek.</p>
        {/* Geri bildirim verileri buraya eklenecek */}
      </main>
    </div>
  );
}