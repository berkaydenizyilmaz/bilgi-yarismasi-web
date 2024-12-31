"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Brain, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dinamik navigasyon menüsü oluşturma
  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    ...(user ? [
      { name: 'Oyna', href: '/play' },
      { name: 'Lider Tablosu', href: '/dashboard/leaderboard' },
      { name: 'İletişim', href: '/dashboard/contact' },
      { name: 'Profil', href: '/dashboard/profile' },
      // Admin rolüne sahip kullanıcılar için ekstra menü
      ...(user.role === 'admin' ? [{ name: 'Admin Paneli', href: '/admin' }] : []),
    ] : [])
  ];

  // Mobil menüyü ekran genişliğine göre otomatik kapatma
  useEffect(() => {
    const closeMenuOnResize = () => window.innerWidth >= 768 && setIsMenuOpen(false);
    window.addEventListener('resize', closeMenuOnResize);
    return () => window.removeEventListener('resize', closeMenuOnResize);
  }, []);

  return (
    <header className="bg-orange-600 text-white py-6 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo ve site başlığı */}
        <Link href="/" className="flex items-center space-x-3">
          <Brain className="h-12 w-12" />
          <span className="text-4xl font-bold">QuizVerse</span>
        </Link>

        {/* Mobil menü toggle butonu */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Ana navigasyon */}
        <nav className={cn(
          "md:flex items-center space-x-6",
          isMenuOpen ? "absolute top-20 left-0 right-0 bg-orange-600 p-4 md:relative md:top-0 md:bg-transparent md:p-0" : "hidden md:flex"
        )}>
          {/* Navigasyon linkleri */}
          <div className={cn(
            "md:flex md:space-x-6",
            isMenuOpen ? "flex flex-col space-y-2 md:space-y-0" : "hidden md:flex"
          )}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  pathname === item.href ? "bg-orange-700" : "hover:bg-orange-700"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Kullanıcı durumuna göre gösterilecek butonlar */}
          {isLoading ? (
            <LoadingSpinner className="w-6 h-6" />
          ) : user ? (
            <Button onClick={logout} className="bg-gray-900 hover:bg-gray-800">
              Çıkış Yap
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="hover:bg-orange-700">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-black hover:bg-gray-800">
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