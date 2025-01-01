"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, MessageSquare, Users, Plus, Monitor, Menu, X, FileQuestion, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"

// Menü öğeleri tipi
interface MenuItem {
  href: string
  label: string
  icon: JSX.Element
}

// Menü öğeleri
const menuItems: MenuItem[] = [
  { href: "/admin", label: "Genel", icon: <Home className="h-5 w-5 lg:h-6 lg:w-6" /> },
  { href: "/admin/users", label: "Kullanıcılar", icon: <Users className="h-5 w-5 lg:h-6 lg:w-6" /> },
  { href: "/admin/questions", label: "Sorular", icon: <FileQuestion className="h-5 w-5 lg:h-6 lg:w-6" /> },
  { href: "/admin/categories", label: "Kategoriler", icon: <FolderTree className="h-5 w-5 lg:h-6 lg:w-6" /> },
  { href: "/admin/logs", label: "Loglar", icon: <FileText className="h-5 w-5 lg:h-6 lg:w-6" /> },
  { href: "/admin/feedbacks", label: "Geri Bildirimler", icon: <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6" /> },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Ekran boyutu kontrolü
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsOpen(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <>
      {/* Mobil menü butonu */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-orange-600 hover:bg-orange-700 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Overlay - sadece mobilde ve menü açıkken */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-[240px] lg:w-64 
        bg-orange-600 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 lg:p-6 h-full overflow-y-auto">
          {/* Logo veya başlık alanı */}
          <div className="mb-6 pt-4 lg:pt-0">
            <h2 className="text-xl lg:text-2xl font-bold text-center">Admin Panel</h2>
          </div>

          {/* Navigasyon */}
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => isMobile && setIsOpen(false)}
                      className={`
                        flex items-center p-3 rounded-lg
                        text-sm lg:text-base
                        transition-all duration-200 
                        hover:bg-orange-700/70 hover:translate-x-1
                        ${isActive ? 'bg-orange-700 shadow-md' : ''}
                      `}
                    >
                      <span className="inline-flex items-center justify-center">
                        {item.icon}
                      </span>
                      <span className="ml-3 font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}

export { AdminSidebar }