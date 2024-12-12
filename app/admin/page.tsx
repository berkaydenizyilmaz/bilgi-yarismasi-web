import AdminHeader from "@/components/AdminHeader";

export default function AdminDashboard() {
  return (
    <div>
      <AdminHeader />
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">Ana Sayfa</h2>
        <p>Burada genel istatistikler ve önemli bildirimler yer alacak.</p>
        {/* İstatistikler ve diğer içerikler buraya eklenecek */}
      </main>
    </div>
  );
}