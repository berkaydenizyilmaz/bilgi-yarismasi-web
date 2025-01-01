"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, MessageSquare, Users, Menu, X, FileQuestion, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"

const menuItems = [
  { href: "/admin", label: "Genel", icon: <Home className="h-5 w-5" /> },
  { href: "/admin/users", label: "Kullanıcılar", icon: <Users className="h-5 w-5" /> },
  { href: "/admin/questions", label: "Sorular", icon: <FileQuestion className="h-5 w-5" /> },
  { href: "/admin/categories", label: "Kategoriler", icon: <FolderTree className="h-5 w-5" /> },
  { href: "/admin/logs", label: "Loglar", icon: <FileText className="h-5 w-5" /> },
  { href: "/admin/feedbacks", label: "Geri Bildirimler", icon: <MessageSquare className="h-5 w-5" /> },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
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
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static
        top-0 left-0 h-full
        w-[280px] lg:w-[240px]
        bg-white shadow-lg
        z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:my-14 lg:mx-6
        lg:rounded-lg
      `}>
        <div className="p-6 mt-16 lg:mt-0">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Paneli</h2>
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
                        text-sm font-medium
                        transition-all duration-200 
                        ${isActive 
                          ? 'bg-orange-100 text-orange-600' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
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