import { memo } from "react"
import Link from "next/link"
import { Brain, Github, Instagram, Linkedin } from "lucide-react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

// Sosyal medya linki için tip tanımı
interface SocialLink {
  href: string;
  icon: React.ReactNode;
  label: string;
}

// Hızlı link için tip tanımı
interface QuickLink {
  href: string;
  label: string;
}

// Sosyal medya linki bileşeni
const SocialLink = memo<SocialLink>(({ href, icon, label }) => (
  <motion.div 
    whileHover={{ y: -3 }} 
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <Link 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="hover:text-orange-500 transition-colors"
      aria-label={label}
    >
      {icon}
    </Link>
  </motion.div>
))

SocialLink.displayName = 'SocialLink'

// Hızlı link bileşeni
const QuickLink = memo<QuickLink>(({ href, label }) => (
  <motion.li 
    whileHover={{ x: 5 }} 
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <Link 
      href={href} 
      className="hover:text-orange-500 transition-colors inline-flex items-center gap-1"
    >
      {label}
    </Link>
  </motion.li>
))

QuickLink.displayName = 'QuickLink'

// Ana bileşen
export default function Footer() {
  const pathname = usePathname()
  const isAiMode = pathname.includes('/play/ai') || pathname.includes('/play/aiplus')

  // Stil sınıfları
  const footerBgClass = isAiMode 
    ? "bg-gradient-to-br from-purple-900 to-pink-900 text-purple-100" 
    : "bg-gray-900 text-gray-300"

  const socialLinks: SocialLink[] = [
    {
      href: "https://github.com/berkaydenizyilmaz",
      icon: <Github className="h-5 w-5 md:h-6 md:w-6" />,
      label: "GitHub"
    },
    {
      href: "https://www.instagram.com/berkaydeniz_",
      icon: <Instagram className="h-5 w-5 md:h-6 md:w-6" />,
      label: "Instagram"
    },
    {
      href: "https://www.linkedin.com/in/berkaydenizyilmaz/",
      icon: <Linkedin className="h-5 w-5 md:h-6 md:w-6" />,
      label: "LinkedIn"
    }
  ]

  const quickLinks: QuickLink[] = [
    { href: "/dashboard/profile", label: "Profil" },
    { href: "/dashboard/contact", label: "İletişim" }
  ]

  return (
    <footer className={`${footerBgClass} mt-auto`}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Logo ve açıklama */}
          <div className="sm:col-span-2">
            <motion.div 
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Brain className={`h-6 w-6 md:h-8 md:w-8 ${
                isAiMode ? "text-pink-400" : "text-orange-500"
              }`} />
              <span className="text-xl md:text-2xl font-bold text-white">QuizVerse</span>
            </motion.div>
            <p className={isAiMode ? "text-purple-200" : "text-gray-400"}>
              QuizVerse ile bilgi evreninde yolculuğa çıkın, 
              öğrenmeyi eğlenceye dönüştürün.
            </p>
          </div>

          {/* Hızlı linkler */}
          <div>
            <h3 className="text-white font-semibold mb-3">Hızlı Linkler</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <QuickLink key={link.href} {...link} />
              ))}
            </ul>
          </div>

          {/* Sosyal medya */}
          <div>
            <h3 className="text-white font-semibold mb-3">Bizi Takip Edin</h3>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <SocialLink key={link.href} {...link} />
              ))}
            </div>
          </div>
        </div>

        {/* Telif hakkı */}
        <div className={`border-t ${
          isAiMode ? "border-purple-800" : "border-gray-800"
        } mt-6 md:mt-8 pt-6 md:pt-8 text-center text-sm ${
          isAiMode ? "text-purple-200" : "text-gray-400"
        }`}>
          <p>&copy; {new Date().getFullYear()} QuizVerse. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}