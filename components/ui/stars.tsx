"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

export function Stars() {
  return (
    <div className="relative inline-flex">
      <Star className="w-5 h-5 text-white" />
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Star className="w-5 h-5 text-white" />
      </motion.div>
    </div>
  )
} 