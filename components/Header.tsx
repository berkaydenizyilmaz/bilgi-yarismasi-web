"use client"

import React from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

function Header() {
  const { logout } = useAuth()

  return (
    <header className="bg-orange-600 text-white p-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center">
        <div className="text-2xl font-bold">Bilgi Yarışması</div>
      </div>
      <nav className="flex space-x-20 text-lg">
        <Link href="/" className="transition duration-200 text-white py-2 px-4 rounded hover:bg-white hover:text-orange-600">
          Ana Sayfa
        </Link>
        <Link href="/dashboard/leaderboard" className="transition duration-200 text-white py-2 px-4 rounded hover:bg-white hover:text-orange-600">
          Lider Tablosu
        </Link>
        <Link href="/dashboard/contact" className="transition duration-200 text-white py-2 px-4 rounded hover:bg-white hover:text-orange-600">
          İletişim
        </Link>
        <Link href="/dashboard/profile" className="transition duration-200 text-white py-2 px-4 rounded hover:bg-white hover:text-orange-600">
          Profil
        </Link>
      </nav>
      <button
        onClick={logout}
        className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition duration-200"
      >
        Çıkış Yap
      </button>
    </header>
  )
}

export default Header