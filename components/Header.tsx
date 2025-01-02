"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Brain, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function Header() {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(true)

  const isAiMode = pathname.includes('/play/ai') || pathname.includes('/play/aiplus')

  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    ...(user ? [
      { name: 'Oyna', href: '/play' },
      { name: 'Lider Tablosu', href: '/dashboard/leaderboard' },
      { name: 'İletişim', href: '/dashboard/contact' },
      { name: 'Profil', href: '/dashboard/profile' },
      ...(user.role === 'admin' ? [{ name: 'Admin Paneli', href: "/admin" }] : []),
    ] : [])
  ]

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <header className={`
      ${isAiMode 
        ? "bg-gradient-to-r from-purple-600 to-pink-500 shadow-purple-500/20" 
        : "bg-gradient-to-r from-orange-600 to-orange-500 shadow-orange-500/20"
      } text-white py-6 shadow-lg relative z-50`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 group"
            >
              <div className="bg-white/10 p-2.5 rounded-xl group-hover:bg-white/20 transition-colors duration-300">
                <Brain className="h-9 w-9" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                QuizVerse
              </span>
            </motion.div>
          </Link>

          {/* Mobil menü butonu */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </motion.button>

          {/* Ana navigasyon */}
          <AnimatePresence>
            {(isMenuOpen || !isMobile) && (
              <motion.nav
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "absolute md:relative top-full left-0 right-0 md:top-auto",
                  "backdrop-blur-lg md:backdrop-blur-none",
                  isAiMode 
                    ? "bg-purple-600/95 md:bg-transparent" 
                    : "bg-orange-600/95 md:bg-transparent",
                  "p-4 md:p-0",
                  "md:flex items-center space-x-1 md:space-x-4",
                  "border-t border-white/10 md:border-none",
                  isMenuOpen ? "block" : "hidden md:flex"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-base font-medium",
                        "transition-all duration-200",
                        "hover:bg-white/10",
                        pathname === item.href
                          ? "bg-white/20 text-white" 
                          : "text-white/90 hover:text-white"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Kullanıcı işlemleri */}
                <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3">
                  {isLoading ? (
                    <LoadingSpinner className="w-6 h-6" />
                  ) : user ? (
                    <Button 
                      onClick={logout} 
                      variant="ghost"
                      className="w-full md:w-auto text-base font-medium hover:bg-white/10 text-white/90 hover:text-white transition-all duration-200"
                    >
                      Çıkış Yap
                    </Button>
                  ) : (
                    <div className="flex flex-col md:flex-row w-full md:w-auto space-y-2 md:space-y-0 md:space-x-3">
                      <Link href="/auth/login" className="w-full md:w-auto">
                        <Button 
                          variant="ghost" 
                          className="w-full text-base font-medium hover:bg-white/10 text-white/90 hover:text-white transition-all duration-200"
                        >
                          Giriş Yap
                        </Button>
                      </Link>
                      <Link href="/auth/register" className="w-full md:w-auto">
                        <Button 
                          className="w-full text-base font-medium bg-white hover:bg-white/90 text-orange-600 hover:text-orange-700 transition-all duration-200"
                        >
                          Kayıt Ol
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}