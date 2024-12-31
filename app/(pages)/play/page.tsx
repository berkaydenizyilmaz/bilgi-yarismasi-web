"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PlayPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-8">
          Quiz Modları
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/play/classic" className="block">
            <Card className="flex flex-col items-center p-6 md:p-8 shadow-lg transition-transform hover:scale-105 h-full">
              <h2 className="text-2xl md:text-3xl font-bold text-orange-600 mb-4">Klasik Mod</h2>
              <p className="text-base md:text-lg text-gray-800 mb-6 text-center">
                Kategoriler arasından seçim yapın ve bilginizi test edin!
              </p>
              <Button className="bg-orange-600 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg shadow-lg">
                Başla
              </Button>
            </Card>
          </Link>

          <Card className="flex flex-col items-center p-6 md:p-8 shadow-lg h-full">
            <h2 className="text-2xl md:text-3xl font-bold text-orange-600 mb-4">Yapay Zeka Modu</h2>
            <p className="text-base md:text-lg text-gray-800 mb-6 text-center">
              Yapay zeka tarafından anlık üretilen sorularla yeni deneyimler yaşayın!
            </p>
            <Button 
              className="bg-gray-300 text-gray-500 cursor-not-allowed font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg shadow-lg"
              disabled
            >
              Yakında
            </Button>
          </Card>

          <Card className="flex flex-col items-center p-6 md:p-8 shadow-lg h-full">
            <h2 className="text-2xl md:text-3xl font-bold text-orange-600 mb-4">Yapay Zeka+ Modu</h2>
            <p className="text-base md:text-lg text-gray-800 mb-6 text-center">
              Kategoriyi siz belirleyin, yapay zeka soruları üretsin!
            </p>
            <Button 
              className="bg-gray-300 text-gray-500 cursor-not-allowed font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg shadow-lg"
              disabled
            >
              Yakında
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}