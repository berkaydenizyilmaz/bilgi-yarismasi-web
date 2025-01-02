"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Brain, Menu, X, LogOut, LogIn, UserPlus } from "lucide-react"
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
    <div className={`
      ${isAiMode 
        ? "bg-gradient-to-br from-purple-600 to-pink-500 shadow-purple-500/20"
        : "bg-gradient-to-r from-orange-600 to-orange-500 shadow-orange-500/20"
      } relative z-50`}
    >
      <header className="text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo - Geliştirilmiş animasyonlar */}
            <Link href="/">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 group"
              >
                <motion.div 
                  className="bg-white/10 p-2.5 rounded-xl transition-all duration-300 ease-out"
                  whileHover={{
                    scale: 1.1,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 10
                    }
                  }}
                  whileTap={{ 
                    scale: 0.9,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 10
                    }
                  }}
                >
                  <motion.div
                    animate={{ rotate: 0 }}
                    whileHover={{ 
                      rotate: 360,
                      transition: {
                        duration: 1,
                        ease: "linear",
                        repeat: Infinity
                      }
                    }}
                  >
                    <Brain className="h-9 w-9 transition-colors duration-300 ease-out" />
                  </motion.div>
                </motion.div>
                <motion.span 
                  className={`text-3xl font-bold ${
                    isAiMode 
                      ? "bg-gradient-to-r from-white via-purple-200 to-pink-200"
                      : "bg-gradient-to-r from-white via-orange-100 to-yellow-200"
                  } bg-clip-text text-transparent`}
                  whileHover={{
                    scale: 1.05,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 17
                    }
                  }}
                >
                  QuizVerse
                </motion.span>
              </motion.div>
            </Link>

            {/* Masaüstü navigasyon */}
            <nav className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-base font-medium",
                      "transition-all duration-200",
                      isAiMode
                        ? "hover:bg-white/10"
                        : "hover:bg-white/10",
                      (pathname === item.href) || (pathname.includes(item.href) && item.href !== '/')
                        ? isAiMode 
                          ? "bg-white/20 text-white" 
                          : "bg-white/20 text-white"
                        : "text-white/90 hover:text-white"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Masaüstü kullanıcı işlemleri */}
              <div className="flex items-center space-x-3">
                {isLoading ? (
                  <LoadingSpinner className="w-6 h-6" />
                ) : user ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 17
                    }}
                  >
                    <Button 
                      onClick={logout} 
                      variant="ghost"
                      className={`group text-base font-medium text-white transition-all duration-300 ease-out
                        ${isAiMode 
                          ? "hover:bg-white/15 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] border border-transparent hover:border-white/20" 
                          : "hover:bg-white/10"
                        }`}
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        whileHover={{ 
                          rotate: 12,
                          x: 2,
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 17
                          }
                        }}
                      >
                        <LogOut className="w-5 h-5 mr-2" />
                      </motion.div>
                      Çıkış Yap
                    </Button>
                  </motion.div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/auth">
                        <Button 
                          variant="ghost" 
                          className={`group text-base font-medium text-white/90 hover:text-white transition-all duration-300
                            ${isAiMode 
                              ? "hover:bg-purple-500/50" 
                              : "hover:bg-white/10"
                            }`}
                        >
                          <LogIn className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                          Giriş Yap
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </nav>

            {/* Geliştirilmiş mobil menü butonu */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`md:hidden p-2 rounded-lg transition-all duration-300
                ${isAiMode 
                  ? "hover:bg-purple-500/50" 
                  : "hover:bg-white/10"
                }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobil menü - Geliştirilmiş butonlar */}
      <AnimatePresence>
        {(isMenuOpen && isMobile) && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "p-4",
              "border-t border-white/5",
              "block md:hidden"
            )}
          >
            <motion.div 
              className="flex flex-col space-y-2"
              variants={{
                hidden: { opacity: 0, y: -20 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-base font-medium",
                    "transition-all duration-200",
                    isAiMode
                      ? "hover:bg-white/10"
                      : "hover:bg-white/10",
                    (pathname === item.href) || (pathname.includes(item.href) && item.href !== '/')
                      ? isAiMode 
                        ? "bg-white/20 text-white" 
                        : "bg-white/20 text-white"
                      : "text-white/90 hover:text-white"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobil kullanıcı işlemleri - Geliştirilmiş butonlar */}
              <div className="flex flex-col space-y-2 mt-2">
                {isLoading ? (
                  <LoadingSpinner className="w-6 h-6" />
                ) : user ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={logout} 
                      variant="ghost"
                      className={`w-full group text-base font-medium text-white/90 hover:text-white transition-all duration-300
                        ${isAiMode 
                          ? "hover:bg-white/15 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:border hover:border-white/20" 
                          : "hover:bg-white/10"
                        }`}
                    >
                      <LogOut className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                      Çıkış Yap
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link href="/auth">
                        <Button 
                          variant="ghost" 
                          className={`w-full group text-base font-medium text-white/90 hover:text-white transition-all duration-300
                            ${isAiMode 
                              ? "hover:bg-purple-500/50" 
                              : "hover:bg-white/10"
                            }`}
                        >
                          <LogIn className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                          Giriş Yap
                        </Button>
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}