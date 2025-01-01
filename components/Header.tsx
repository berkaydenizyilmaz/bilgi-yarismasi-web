"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Brain, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"

export default function Header() {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    ...(user ? [
      { name: 'Oyna', href: '/play' },
      { name: 'Lider Tablosu', href: '/dashboard/leaderboard' },
      { name: 'İletişim', href: '/dashboard/contact' },
      { name: 'Profil', href: '/dashboard/profile' },
      ...(user.role === 'admin' ? [{ name: 'Admin Paneli', href: '/admin' }] : []),
    ] : [])
  ]

  useEffect(() => {
    const closeMenu = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('resize', closeMenu)
    return () => window.removeEventListener('resize', closeMenu)
  }, [])

  return (
    <header className="bg-orange-600 text-white py-8 shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-10 w-10" />
            <span className="text-3xl font-bold">QuizVerse</span>
          </Link>

          {/* Mobil menü butonu */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Ana navigasyon */}
          <nav className={cn(
            "absolute md:relative top-full left-0 right-0 md:top-auto",
            "bg-orange-600 md:bg-transparent",
            "p-4 md:p-0",
            "md:flex items-center space-x-1 md:space-x-4",
            isMenuOpen ? "block" : "hidden md:flex"
          )}>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-m font-medium",
                    "transition-colors duration-200",
                    pathname === item.href 
                      ? "bg-orange-700 text-white" 
                      : "hover:bg-orange-700 text-white"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Kullanıcı işlemleri */}
            <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              {isLoading ? (
                <LoadingSpinner className="w-6 h-6" />
              ) : user ? (
                <Button 
                  onClick={logout} 
                  className="w-full md:w-auto bg-gray-900 hover:bg-gray-800"
                >
                  Çıkış Yap
                </Button>
              ) : (
                <div className="flex flex-col md:flex-row w-full md:w-auto space-y-2 md:space-y-0 md:space-x-4">
                  <Link href="/auth/login" className="w-full md:w-auto">
                    <Button variant="ghost" className="w-full hover:bg-orange-700">
                      Giriş Yap
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="w-full md:w-auto">
                    <Button className="w-full bg-black hover:bg-gray-800">
                      Kayıt Ol
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}