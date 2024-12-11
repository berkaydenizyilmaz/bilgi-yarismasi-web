"use client"

import React from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "./ui/button"

function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-orange-600 text-white p-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center">
        <Link href="/">
          <div className="text-2xl font-bold cursor-pointer">Bilgi Yarışması</div>
        </Link>
      </div>

      <nav className="flex items-center space-x-6">
        <Link href="/" className="transition duration-200 text-white py-2 px-4 rounded hover:bg-white hover:text-orange-600">
          Ana Sayfa
        </Link>

        {user ? (
          <>
            <Link href="/dashboard/leaderboard" className="transition duration-200 text-white py-2 px-4 rounded hover:bg-white hover:text-orange-600">
              Lider Tablosu
            </Link>
            <Link href="/quiz/categories" className="transition duration-200 text-white py-2 px-4 rounded hover:bg-white hover:text-orange-600">
              Yarışmaya Başla
            </Link>
            <Link href="/dashboard/profile" className="transition duration-200 text-white py-2 px-4 rounded hover:bg-white hover:text-orange-600">
              Profil
            </Link>
            <button
              onClick={logout}
              className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Çıkış Yap
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:bg-white hover:text-orange-600">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-white text-orange-600 hover:bg-gray-100">
                Üye Ol
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header