'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PlayPage() {
    const router = useRouter();

    const handleClassicMode = () => {
        router.push('/play/classic'); // Klasik mod seçildiğinde kategori sayfasına yönlendir
    };

    const handleAIModel = () => {
        // Yapay zeka moduna yönlendirme işlemi
    };

    return (
        <div className="min-h-screen px-4 flex flex-col items-center mt-36">
            <h1 className="text-4xl font-bold text-orange-600 mb-8">Oyun Modları</h1>
            <p className="text-lg text-gray-700 mb-12 text-center max-w-2xl">
                Bİr mod seçin ve yarışmaya başlayın
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-7xl">
                <Card className="flex flex-col items-center p-8 shadow-lg transition-transform transform hover:scale-105">
                    <h1 className="text-3xl font-bold text-orange-600 mb-4">Klasik Mod</h1>
                    <p className="text-lg text-gray-800 mb-6 text-center">Klasik modda, hazır sorulardan yararlanarak oyun oynayacaksınız. Eğlenceli ve öğretici bir deneyim için hazır olun!</p>
                    <Button 
                        onClick={handleClassicMode} 
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg"
                    >
                        Başla
                    </Button>
                </Card>
                <Card className="flex flex-col items-center p-8 shadow-lg transition-transform transform hover:scale-105">
                    <h1 className="text-3xl font-bold text-orange-600 mb-4">Yapay Zeka Modu</h1>
                    <p className="text-lg text-gray-800 mb-6 text-center">Yapay zeka modunda, sorular anlık olarak yapay zeka tarafından üretiliyor. Her seferinde yeni bir deneyim yaşayın!</p>
                    <Button 
                        onClick={handleAIModel} 
                        className="bg-gray-300 text-gray-500 cursor-not-allowed font-bold py-4 px-8 rounded-lg shadow-lg"
                        disabled
                    >
                        Yakında
                    </Button>
                </Card>
                <Card className="flex flex-col items-center p-8 shadow-lg transition-transform transform hover:scale-105">
                    <h1 className="text-3xl font-bold text-orange-600 mb-4">Yapay Zeka+ Modu</h1>
                    <p className="text-lg text-gray-800 mb-6 text-center">Yapay zeka+ modunda, kategoriyi de siz belirliyorsunuz ve sorular anlık olarak yapay zeka tarafından üretiliyor. Her seferinde yeni bir deneyim yaşayın!</p>
                    <Button 
                        onClick={handleAIModel} 
                        className="bg-gray-300 text-gray-500 cursor-not-allowed font-bold py-4 px-8 rounded-lg shadow-lg"
                        disabled
                    >
                        Yakında
                    </Button>
                </Card>
            </div>
        </div>
    );
}