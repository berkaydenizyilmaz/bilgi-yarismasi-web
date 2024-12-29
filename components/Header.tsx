"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Brain, Menu, X } from "lucide-react" // Menü ve kapatma ikonları
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { usePathname } from "next/navigation"

function Header() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    ...(user ? [
      { name: 'Oyna', href: '/play' },
      { name: 'Lider Tablosu', href: '/dashboard/leaderboard' },
      { name: 'İletişim', href: '/dashboard/contact' },
      { name: 'Profil', href: '/dashboard/profile' },
      ...(user.role === 'admin' ? [{ name: 'Admin Paneli', href: '/admin' }] : []),
    ] : [])
  ];

  // Sayfa boyutu değiştiğinde menüyü kapat
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header className="bg-orange-600 text-white py-6 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <Brain className="h-12 w-12" />
          <span className="text-4xl font-bold">QuizVerse</span>
        </Link>

        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />} {/* Menü açma/kapama ikonu */}
        </button>

        <nav className={`md:flex items-center space-x-6 ${isMenuOpen ? "block" : "hidden"} md:block`}>
          <div className={`md:flex md:space-x-6 ${isMenuOpen ? "flex flex-col" : "hidden md:flex"}`}>
          {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  pathname === item.href || item.href.includes("/admin") ? "bg-orange-700 text-white" : "text-white hover:bg-orange-700"
                )}
                onClick={() => setIsMenuOpen(false)} // Mobilde tıklanınca menüyü kapat
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {isLoading ? (
            <LoadingSpinner className="w-6 h-6 text-white" />
          ) : user ? (
            <Button onClick={logout} className="bg-gray-900 hover:bg-gray-800 text-white">
              Çıkış Yap
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-white hover:bg-orange-700">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          )}
          
        </nav>
      </div>
    </header>
  );
}

export default Header;