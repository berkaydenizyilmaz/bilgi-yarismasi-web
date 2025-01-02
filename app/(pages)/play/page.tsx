"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { Brain, Sparkles, Stars } from "lucide-react"

export default function PlayPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Başlık Bölümü */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-4"
          >
            Quiz Modları
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600"
          >
            Tercih ettiğiniz modu seçin ve yarışmaya başlayın!
          </motion.p>
        </div>
        
        {/* Quiz Modları Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Klasik Mod */}
          <motion.div variants={item}>
            <Link href="/play/classic" className="block h-full">
              <Card className="group relative h-full overflow-hidden rounded-2xl border-2 border-transparent hover:border-orange-200 transition-all duration-300">
                <div className="flex flex-col items-center p-8 md:p-10">
                  <div className="mb-6 p-4 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors duration-300">
                    <Brain className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                    Klasik Mod
                  </h2>
                  <p className="text-base md:text-lg text-gray-600 mb-8 text-center">
                    Kategoriler arasından seçim yapın ve bilginizi test edin!
                  </p>
                  <Button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-3 px-8 rounded-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                    Başla
                  </Button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-orange-100/0 to-orange-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            </Link>
          </motion.div>

          {/* Yapay Zeka Modu */}
          <motion.div variants={item}>
            <Link href="/play/ai" className="block h-full">
              <Card className="group relative h-full overflow-hidden rounded-2xl border-2 border-transparent hover:border-orange-200 transition-all duration-300">
                <div className="flex flex-col items-center p-8 md:p-10">
                  <div className="mb-6 p-4 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors duration-300">
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                    Yapay Zeka Modu
                  </h2>
                  <p className="text-base md:text-lg text-gray-600 mb-8 text-center">
                    Yapay zeka tarafından anlık üretilen sorularla yeni deneyimler yaşayın!
                  </p>
                  <Button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-3 px-8 rounded-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                    Başla
                  </Button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-orange-100/0 to-orange-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            </Link>
          </motion.div>

          {/* Yapay Zeka+ Modu */}
          <motion.div variants={item}>
            <Link href="/play/aiplus" className="block h-full">
              <Card className="group relative h-full overflow-hidden rounded-2xl border-2 border-transparent hover:border-orange-200 transition-all duration-300">
                <div className="flex flex-col items-center p-8 md:p-10">
                  <div className="mb-6 p-4 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors duration-300">
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                    Yapay Zeka+ Modu
                  </h2>
                  <p className="text-base md:text-lg text-gray-600 mb-8 text-center">
                    Kategoriyi siz belirleyin yapay zeka soruları üretsin.
                  </p>
                  <Button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-3 px-8 rounded-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                    Başla
                  </Button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-orange-100/0 to-orange-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}