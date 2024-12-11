"use client"

import React from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "./ui/button"
import { Brain } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Kategoriler', href: '/quiz/categories' },
    { name: 'Lider Tablosu', href: '/dashboard/leaderboard' },
    { name: 'Profil', href: '/dashboard/profile' },
  ]

  return (
    <header className="bg-orange-600 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8" />
            <span className="text-2xl font-bold">QuizVerse</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-orange-700 text-white"
                    : "text-white hover:bg-orange-700"
                )}
              >
                {item.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={logout}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Çıkış Yap
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header