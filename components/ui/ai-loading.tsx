"use client"

import { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Sparkles, Stars, Zap } from "lucide-react"

// Animasyon sabitleri
const ANIMATIONS = {
  brain: {
    rotate: {
      animate: { rotate: [0, 15, -15, 0] },
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    scale: {
      animate: { scale: [1, 1.15, 1] },
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    glow: {
      animate: { opacity: [0.5, 1, 0.5] },
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  },
  energyRing: {
    animate: { 
      rotate: 360,
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.6, 0.3]
    },
    transition: { 
      rotate: { duration: 10, repeat: Infinity, ease: "linear" },
      scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  },
  particles: (i: number) => ({
    animate: { 
      y: [0, -20, 0],
      opacity: [0, 1, 0],
      scale: [0.8, 1.2, 0.8]
    },
    transition: { 
      duration: 2 + Math.random(),
      repeat: Infinity,
      delay: i * 0.2,
      ease: "easeInOut"
    }
  }),
  text: {
    animate: { opacity: [0.7, 1, 0.7] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  energyWaves: (i: number) => ({
    animate: { 
      scale: [1, 2, 1],
      opacity: [0.3, 0, 0.3],
      borderRadius: ["40%", "50%", "40%"]
    },
    transition: { 
      duration: 3,
      repeat: Infinity,
      delay: i * 0.3,
      ease: "easeInOut"
    }
  }),
  starParticles: (i: number) => ({
    animate: { 
      rotate: [0, 360],
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
    },
    transition: { 
      duration: 2,
      repeat: Infinity,
      delay: i * 0.1,
      ease: "easeInOut"
    }
  }),
  electricity: {
    animate: { 
      pathLength: [0, 1, 0],
      opacity: [0, 1, 0],
      strokeDasharray: ["0 1", "1 0", "0 1"]
    },
    transition: { 
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Enerji parçacıkları bileşeni
const EnergyParticles = memo(() => (
  <div className="absolute inset-0">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-purple-400 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`
        }}
        {...ANIMATIONS.particles(i)}
      />
    ))}
  </div>
))

EnergyParticles.displayName = 'EnergyParticles'

// Yeni: Elektrik efekti bileşeni
const ElectricityEffect = memo(() => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
    {[...Array(8)].map((_, i) => (
      <motion.path
        key={i}
        d={`M50 0 Q ${45 + Math.random() * 10} ${50 + Math.random() * 20}, 50 100`}
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="0.5"
        fill="none"
        {...ANIMATIONS.electricity}
      />
    ))}
  </svg>
))

ElectricityEffect.displayName = 'ElectricityEffect'

// Yeni: Yıldız parçacıkları bileşeni
const StarParticles = memo(() => (
  <div className="absolute inset-0">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)`
        }}
        {...ANIMATIONS.starParticles(i)}
      />
    ))}
  </div>
))

StarParticles.displayName = 'StarParticles'

// Ana bileşen
export function AiLoading() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999]"
      >
        {/* Geliştirilmiş arkaplan */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
          <div className="absolute inset-0 opacity-30">
            {/* Enerji dalgaları */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)'
                }}
                {...ANIMATIONS.energyWaves(i)}
              />
            ))}
            
            {/* Arkaplan parçacıkları */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-40 w-40 bg-white rounded-full blur-3xl"
                animate={{
                  x: [Math.random() * 100, Math.random() * 100],
                  y: [Math.random() * 100, Math.random() * 100],
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 15 + Math.random() * 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Ana içerik */}
        <div className="fixed inset-0 flex items-center justify-center z-[10000]">
          <div className="max-w-2xl w-full mx-auto p-8">
            <div className="flex flex-col items-center justify-center gap-12">
              {/* Ana animasyon konteyner */}
              <div className="relative">
                {/* Enerji halkaları */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute -inset-${8 + i * 4} rounded-full opacity-30`}
                    {...ANIMATIONS.energyRing}
                    transition={{
                      ...ANIMATIONS.energyRing.transition,
                      delay: i * 0.2
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 blur-xl" />
                  </motion.div>
                ))}

                {/* Yeni: Yıldız parçacıkları */}
                <StarParticles />

                {/* Ana ikon */}
                <motion.div
                  className="relative"
                  {...ANIMATIONS.brain.rotate}
                >
                  <motion.div
                    className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-6"
                    {...ANIMATIONS.brain.scale}
                  >
                    {/* Yeni: Elektrik efektleri */}
                    <ElectricityEffect />
                    
                    {/* Parlama efekti */}
                    <motion.div
                      className="absolute inset-0 bg-white rounded-full blur-md"
                      {...ANIMATIONS.brain.glow}
                    />
                    
                    <Brain className="w-16 h-16 text-white relative z-10" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Geliştirilmiş animasyonlu yazı */}
              <div className="text-center space-y-6">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  Yapay Zeka Çalışıyor
                </motion.h2>
                
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6 text-purple-300" />
                  </motion.div>
                  <p className="text-lg bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent font-medium">
                    Sorularınız hazırlanıyor...
                  </p>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6 text-pink-300" />
                  </motion.div>
                </div>

                {/* Yükleme noktaları */}
                <div className="flex items-center justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                      animate={{
                        y: [-4, 4, -4],
                        opacity: [0.5, 1, 0.5],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 1.5,
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
      </motion.div>
    </AnimatePresence>
  )
} 