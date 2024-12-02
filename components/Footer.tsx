import React from 'react';
import Link from 'next/link';

function Footer() {
    return (
        <footer className="bg-orange-600 text-white p-4">
            <div className="flex flex-col items-center">
                <p className="mb-2">© 2024 Bilgi Yarışması. Tüm hakları saklıdır.</p>
                <div className="flex space-x-4">
                    <Link 
                        href="https://github.com/berkaydenizyilmaz" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="border-b border-transparent hover:border-white"
                    >
                        GitHub
                    </Link>
                    <Link 
                        href="/dashboard/contact" 
                        className="border-b border-transparent hover:border-white"
                    >
                        İletişim
                    </Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;