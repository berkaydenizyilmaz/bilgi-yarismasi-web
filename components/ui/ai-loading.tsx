"use client"

import { motion } from "framer-motion"
import { Brain, Sparkles, Stars } from "lucide-react"

export function AiLoading() {
  return (
    <>
      {/* Overlay - tüm ekranı kaplayan arka plan */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 z-[9999]" />
      
      {/* Ana içerik */}
      <div className="fixed inset-0 flex items-center justify-center z-[10000]">
        <div className="max-w-2xl w-full mx-auto p-8">
          <div className="flex flex-col items-center justify-center gap-12">
            {/* Ana animasyon konteyner */}
            <div className="relative">
              {/* Parlama efekti halkası */}
              <motion.div
                className="absolute -inset-8 rounded-full opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 blur-xl" />
              </motion.div>

              {/* Ana ikon */}
              <motion.div
                className="relative"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-6"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Brain className="w-16 h-16 text-white" />
                </motion.div>
              </motion.div>

              {/* Dönen yıldızlar */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: `${Math.sin(i * 60 * Math.PI / 180) * 100 + 50}%`,
                      left: `${Math.cos(i * 60 * Math.PI / 180) * 100 + 50}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  >
                    <Stars className="w-4 h-4 text-pink-300" />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Animasyonlu yazı */}
            <div className="text-center space-y-6">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold text-white"
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Yapay Zeka Çalışıyor
              </motion.h2>
              
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-6 h-6 text-pink-300" />
                <p className="text-lg text-purple-100">Sorularınız hazırlanıyor...</p>
                <Sparkles className="w-6 h-6 text-pink-300" />
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                    animate={{
                      y: [-2, 2, -2],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 