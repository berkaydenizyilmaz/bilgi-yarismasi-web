"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const Header = () => {
    const router = useRouter();

    const handleLogout = async () => {
        const response = await fetch("/api/auth/logout", {
            method: "POST",
        });

        if (response.ok) {
            router.push("/login"); // Çıkış yapıldıktan sonra login sayfasına yönlendir
        }
    };

    return (
        <header className="bg-orange-600 text-white shadow-lg">
            <nav className="flex justify-between items-center p-4 max-w-6xl mx-auto">
                <div className="flex space-x-4">
                    <Link href="/" className="text-3xl font-bold hover:text-slate-200 transition duration-200">
                        Bilgi Yarışması
                    </Link>
                </div>
                <div className="flex space-x-6">
                    <Link href="/" className="hover:bg-orange-500 px-4 py-2 rounded transition duration-200">Ana Sayfa</Link>
                    <Link href="/profile" className="hover:bg-orange-500 px-4 py-2 rounded transition duration-200">Profil</Link>
                    <Link href="/leaderboard" className="hover:bg-orange-500 px-4 py-2 rounded transition duration-200">Lider Tablosu</Link>
                </div>
                <div className="flex items-center">
                    <button 
                        onClick={handleLogout} 
                        className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded transition duration-200"
                    >
                        Çıkış Yap
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Header;