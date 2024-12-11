import Link from "next/link"
import { Brain, Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold text-white">QuizVerse</span>
            </div>
            <p className="text-gray-400 mb-4">
              QuizVerse ile bilgi evreninde yolculuğa çıkın, 
              öğrenmeyi eğlenceye dönüştürün.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/quiz/categories" className="hover:text-orange-500 transition-colors">
                  Kategoriler
                </Link>
              </li>
              <li>
                <Link href="/dashboard/leaderboard" className="hover:text-orange-500 transition-colors">
                  Lider Tablosu
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="hover:text-orange-500 transition-colors">
                  Profil
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="text-white font-semibold mb-4">Bizi Takip Edin</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-orange-500 transition-colors">
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} QuizVerse. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer;