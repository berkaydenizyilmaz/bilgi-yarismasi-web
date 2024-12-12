import AdminHeader from "@/components/AdminHeader";

export default function AdminLogs() {
  return (
    <div>
      <AdminHeader />
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">Loglar</h2>
        <p>Burada log kayıtları görüntülenecek.</p>
        {/* Log verileri buraya eklenecek */}
      </main>
    </div>
  );
}