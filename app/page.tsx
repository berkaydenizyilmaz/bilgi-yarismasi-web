"use client";

import Header from "@/components/Header";
import { useState } from "react";

export default function Home() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const categories = ["Genel Kültür", "Bilim", "Tarih", "Coğrafya", "Edebiyat", "Matematik"];

    const handleStartQuiz = (category: string) => {
        setSelectedCategory(category);
        // Burada, kullanıcıyı quiz sayfasına yönlendirebilirsiniz.
        // Örneğin: router.push(`/quiz?category=${category}`);
    };

    return (
      <div>
        <Header/>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <header className="text-center mb-8">
                <h1 className="text-5xl font-bold text-orange-600 mb-2">Bilgi Yarışması</h1>
                <p className="text-lg text-gray-700">Bilgilerinizi test edin ve en yüksek puanı kazanın!</p>
            </header>

            <div className="bg-white shadow-lg rounded-lg p-6 mb-8 w-full max-w-2xl">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Yarışmaya Katılın!</h2>
                <p className="text-gray-600 mb-4">
                    Hemen aşağıdaki butona tıklayarak yarışmaya katılın ve bilgi birikiminizi test edin.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleStartQuiz(category)}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-500 transition duration-200"
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {selectedCategory && (
                <div className="bg-white shadow-lg rounded-lg p-6 mb-8 w-full max-w-2xl">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-4">Seçilen Kategori: {selectedCategory}</h2>
                    <p className="text-gray-600 mb-4">Yarışmaya başlamak için aşağıdaki butona tıklayın:</p>
                    <button
                        className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-500 transition duration-200"
                        onClick={() => {
                            // Burada, kullanıcıyı quiz sayfasına yönlendirebilirsiniz.
                            // Örneğin: router.push(`/quiz?category=${selectedCategory}`);
                        }}
                    >
                        Yarışmaya Başla
                    </button>
                </div>
            )}

            <div className="bg-white shadow-lg rounded-lg p-6 mb-8 w-full max-w-2xl">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Geçmiş Yarışmalar</h2>
                <p className="text-gray-600 mb-4">
                    Daha önceki yarışmalarınızı görüntüleyin ve en yüksek puanları toplayanları görün.
                </p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-500 transition duration-200">
                    Geçmiş Yarışmalar
                </button>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 mb-8 w-full max-w-2xl">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Liderlik Tablosu</h2>
                <p className="text-gray-600 mb-4">
                    Yarışmalarda en yüksek puanları toplayan kullanıcıları görmek için liderlik tablosuna göz atın. 
                    En iyi performans gösterenler arasında yer almak için yarışmalara katılmayı unutmayın!
                </p>
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-500 transition duration-200">
                    Liderlik Tablosunu Görüntüle
                </button>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 mb-8 w-full max-w-2xl">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Nasıl Oynanır?</h2>
                <ul className="list-disc list-inside text-gray-700 mb-4">
                    <li>Her yarışmada 10 soru bulunmaktadır.</li>
                    <li>Doğru cevaplar için puan kazanırsınız.</li>
                    <li>En yüksek puanı toplayan kullanıcılar lider tablosunda yer alır.</li>
                </ul>
            </div>

            <footer className="mt-8 text-center">
                <p className="text-gray-600">© 2023 Bilgi Yarışması. Tüm hakları saklıdır.</p>
            </footer>
        </div>
        </div>
    );
}