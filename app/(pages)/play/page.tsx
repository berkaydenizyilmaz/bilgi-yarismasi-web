"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { Brain, Sparkles, Stars, AlertCircle } from "lucide-react"

// Animasyon varyantları
const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }
} as const

// Quiz modları için tip ve sabit tanımı
type QuizMode = {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  colors: {
    border: string
    iconBg: string
    button: string
    gradient: string
    titleHover: string
  }
}

// Quiz modları sabitleri
const QUIZ_MODES = [
  {
    href: "/play/classic",
    icon: <Brain className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />,
    title: "Klasik Mod",
    description: "Kategoriler arasından seçim yapın ve bilginizi test edin!",
    colors: {
      border: "hover:border-orange-200",
      iconBg: "bg-orange-100 group-hover:bg-orange-200",
      button: "from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600",
      gradient: "from-orange-100/0 to-orange-100/20",
      titleHover: "group-hover:text-orange-600"
    }
  },
  {
    href: "/play/ai",
    icon: <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />,
    title: "Yapay Zeka Modu",
    description: "Yapay zeka tarafından anlık üretilen sorularla yeni deneyimler yaşayın!",
    colors: {
      border: "hover:border-purple-200",
      iconBg: "bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200",
      button: "from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600",
      gradient: "from-purple-600/5 to-pink-500/5",
      titleHover: "group-hover:text-purple-600"
    }
  },
  {
    href: "/play/aiplus",
    icon: <Stars className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />,
    title: "Yapay Zeka+ Modu",
    description: "İstediğiniz konuda yapay zeka size özel sorular üretsin!",
    colors: {
      border: "hover:border-purple-200",
      iconBg: "bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200",
      button: "from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600",
      gradient: "from-purple-600/5 to-pink-500/5",
      titleHover: "group-hover:text-purple-600"
    }
  }
] as const

// Quiz modu kartı bileşeni - Performans için memoize edildi
const QuizModeCard = React.memo(({ mode }: { mode: typeof QUIZ_MODES[number] }) => (
  <motion.div variants={ANIMATION_VARIANTS.item}>
    <Link href={mode.href} className="block h-full">
      <Card className={`group relative h-full overflow-hidden rounded-2xl border-2 border-transparent ${mode.colors.border} transition-all duration-300`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${mode.colors.gradient}`} />
        <div className="flex flex-col items-center p-8 md:p-10 relative">
          <div className={`mb-6 p-4 rounded-full ${mode.colors.iconBg} transition-colors duration-300`}>
            {mode.icon}
          </div>
          {mode.href !== "/play/classic" && (
            <div className="absolute top-4 right-4">
              <motion.div
                animate={{ rotate: mode.href === "/play/ai" ? 360 : -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {mode.href === "/play/ai" ? (
                  <Stars className="w-6 h-6 text-purple-400/30" />
                ) : (
                  <Sparkles className="w-6 h-6 text-pink-400/30" />
                )}
              </motion.div>
            </div>
          )}
          <h2 className={`text-2xl md:text-3xl font-bold text-gray-800 mb-4 ${mode.colors.titleHover} transition-colors duration-300`}>
            {mode.title}
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-8 text-center">
            {mode.description}
          </p>
          <Button className={`bg-gradient-to-r ${mode.colors.button} text-white font-semibold py-3 px-8 rounded-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
            Başla
          </Button>
        </div>
      </Card>
    </Link>
  </motion.div>
))

export default function PlayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 py-12 px-4">
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
          variants={ANIMATION_VARIANTS.container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {QUIZ_MODES.map((mode, index) => (
            <QuizModeCard key={index} mode={mode} />
          ))}
        </motion.div>
      </motion.div>

      {/* Bilgi Notu */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-3xl mx-auto mt-12 p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-orange-100">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-medium text-orange-900 mb-1">Önemli Not</h3>
            <p className="text-orange-700 text-sm leading-relaxed">
              Yapay Zeka ve Yapay Zeka+ modlarında çözülen quizler kaydedilmez ve puan kazandırmaz. 
              Bu modlar pratik yapmak ve farklı konularda kendinizi test etmek için tasarlanmıştır.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}