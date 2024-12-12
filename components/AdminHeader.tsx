import Link from "next/link";

function AdminHeader() {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Paneli</h1>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/admin/logs" className="hover:text-orange-400 transition-colors">Loglar</Link>
            </li>
            <li>
              <Link href="/admin/feedbacks" className="hover:text-orange-400 transition-colors">Geri Bildirimler</Link>
            </li>
            <li>
              <Link href="/admin/users" className="hover:text-orange-400 transition-colors">Kullanıcılar</Link>
            </li>
            <li>
              <Link href="/admin/statistics" className="hover:text-orange-400 transition-colors">İstatistikler</Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-orange-400 transition-colors">Ana Sayfa</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default AdminHeader;