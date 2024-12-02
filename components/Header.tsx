import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function Header() {
    const router = useRouter();

    const handleLogout = async () => {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });

        if (response.ok) {
            router.push('/');
        }
    };

    return (
        <header className="bg-orange-600 text-white p-4 flex justify-between items-center shadow-lg">
            <div className="flex items-center">
                <div className="text-2xl font-bold">Bilgi Yarışması</div>
                {/* Logo burada yer alacak */}
            </div>
            <nav className="flex space-x-20 text-lg">
            <Link href="/" className="transition duration-200 text-white py-2 px-4 rounded hover:bg-white hover:text-orange-600">Ana Sayfa</Link>
                <Link href="/dashboard/leaderboard" className="transition duration-200 text-white py-2 px-4 rounded hover:bg-white hover:text-orange-600">Lider Tablosu</Link>
                <Link href="/dashboard/profile" className="transition duration-200 text-white py-2 px-4 rounded hover:bg-white hover:text-orange-600">Profil</Link>
            </nav>
            <button 
                onClick={handleLogout} 
                className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
                Çıkış Yap
            </button>
        </header>
    );
}

export default Header;