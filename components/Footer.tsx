import Link from "next/link"
import { Brain, Github, Instagram } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()
  const isAiMode = pathname.includes('/play/ai') || pathname.includes('/play/aiplus')

  return (
    <footer className={`${
      isAiMode 
        ? "bg-gradient-to-br from-purple-900 to-pink-900 text-purple-100" 
        : "bg-gray-900 text-gray-300"
      } mt-auto`}
    >
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Ana Bölüm */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Brain className={`h-6 w-6 md:h-8 md:w-8 ${
                isAiMode ? "text-pink-400" : "text-orange-500"
              }`} />
              <span className="text-xl md:text-2xl font-bold text-white">QuizVerse</span>
            </div>
            <p className={`${isAiMode ? "text-purple-200" : "text-gray-400"}`}>
              QuizVerse ile bilgi evreninde yolculuğa çıkın, 
              öğrenmeyi eğlenceye dönüştürün.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/dashboard/profile" 
                  className={`hover:${isAiMode ? "text-pink-400" : "text-orange-500"} transition-colors`}
                >
                  Profil
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/contact" 
                  className={`hover:${isAiMode ? "text-pink-400" : "text-orange-500"} transition-colors`}
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Bizi Takip Edin</h3>
            <div className="flex gap-4">
              <Link 
                href="https://github.com/berkaydenizyilmaz" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`hover:${isAiMode ? "text-pink-400" : "text-orange-500"} transition-colors`}
              >
                <Github className="h-5 w-5 md:h-6 md:w-6" />
              </Link>
              <Link 
                href="https://www.instagram.com/berkaydeniz_" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`hover:${isAiMode ? "text-pink-400" : "text-orange-500"} transition-colors`}
              >
                <Instagram className="h-5 w-5 md:h-6 md:w-6" />
              </Link>
            </div>
          </div>
        </div>

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