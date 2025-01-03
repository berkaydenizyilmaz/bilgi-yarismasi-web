"use client"

import { useState, useEffect, memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, MessageSquare, Users, Menu, X, FileQuestion, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

// Menü öğeleri için tip tanımı
interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

// Sabit menü öğeleri
const menuItems: MenuItem[] = [
  { href: "/admin", label: "Genel", icon: <Home className="h-5 w-5" /> },
  { href: "/admin/users", label: "Kullanıcılar", icon: <Users className="h-5 w-5" /> },
  { href: "/admin/questions", label: "Sorular", icon: <FileQuestion className="h-5 w-5" /> },
  { href: "/admin/categories", label: "Kategoriler", icon: <FolderTree className="h-5 w-5" /> },
  { href: "/admin/logs", label: "Loglar", icon: <FileText className="h-5 w-5" /> },
  { href: "/admin/feedbacks", label: "Geri Bildirimler", icon: <MessageSquare className="h-5 w-5" /> },
]

// Animasyon varyantları
const sidebarVariants = {
  open: { x: 0 },
  closed: { x: -280 }
}

// Menü öğesi bileşeni
const MenuItem = memo<{ item: MenuItem; isActive: boolean; onClick?: () => void }>(({ item, isActive, onClick }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        text-base font-medium
        transition-all duration-200 
        ${isActive 
          ? 'bg-orange-100 text-orange-600 shadow-sm' 
          : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
        }
      `}
    >
      {item.icon}
      <span>{item.label}</span>
    </Link>
  </motion.div>
))

MenuItem.displayName = 'MenuItem'

// Ana bileşen
export default function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Ekran boyutu değişikliklerini takip et
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileView = window.innerWidth < 1024
      setIsMobile(isMobileView)
      setIsOpen(!isMobileView) // Masaüstünde otomatik aç
    }

    // İlk yükleme kontrolü
    checkScreenSize()

    // Pencere boyutu değişikliklerini dinle
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <>
      {/* Mobil menü butonu */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobil overlay */}
      {isMobile && isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "spring", damping: 20 }}
        className={`
          fixed lg:sticky
          top-0 left-0 
          h-screen lg:h-[calc(100vh-8rem)]
          w-[280px] lg:w-64
          bg-white/80 backdrop-blur-sm
          shadow-xl
          z-50 lg:z-0
          p-6
          overflow-y-auto
          scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent
          lg:my-8 lg:ml-8 lg:rounded-2xl
          border border-orange-100
        `}
      >
        <div className="space-y-6">
          {/* Başlık */}
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent"
          >
            Admin Paneli
          </motion.h2>

          {/* Navigasyon menüsü */}
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <MenuItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                onClick={() => isMobile && setIsOpen(false)}
              />
            ))}
          </nav>
        </div>
      </motion.aside>
    </>
  )
}