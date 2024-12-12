"use client"

import React from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "./ui/button"
import { Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./ui/loading-spinner"
import { usePathname } from "next/navigation"

function Header() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    ...(user ? [
      { name: 'Kategoriler', href: '/quiz/categories' },
      { name: 'Lider Tablosu', href: '/dashboard/leaderboard' },
      { name: 'Profil', href: '/dashboard/profile' },
      { name: 'İletişim ', href: '/dashboard/contact' },
      ...(user.role === 'admin' ? [{ name: 'Admin Paneli', href: '/admin' }] : []), // Admin rolü için link ekle
    ] : [])
  ];

  return (
    <header className="bg-orange-600 text-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Brain className="h-10 w-10" />
            <span className="text-3xl font-bold">QuizVerse</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  pathname === item.href
                    ? "bg-orange-700 text-white"
                    : "text-white hover:bg-orange-700"
                )}
              >
                {item.name}
              </Link>
            ))}
            
            {isLoading ? (
              <LoadingSpinner className="w-6 h-6 text-white" />
            ) : user ? (
              <Button
                onClick={logout}
                className="bg-black hover:bg-gray-800 text-white"
              >
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
      </div>
    </header>
  );
}

export default Header;