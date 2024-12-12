import Link from "next/link";

function AdminHeader() {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between">
        <h1 className="text-xl font-bold">Admin Paneli</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/admin/logs" className="hover:underline">Loglar</Link>
            </li>
            <li>
              <Link href="/admin/feedbacks" className="hover:underline">Geri Bildirimler</Link>
            </li>
            <li>
              <Link href="/admin/users" className="hover:underline">Kullanıcılar</Link>
            </li>
            <li>
              <Link href="/admin" className="hover:underline">Ana Sayfa</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default AdminHeader;