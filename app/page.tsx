"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Category {
    id: number;
    name: string;
    description: string;
}

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch("/api/categories");
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Kategoriler alınamadı.");
                }

                setCategories(result.data || []);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Bir hata oluştu");
            } finally {
                setIsLoading(false);
            }
        }

        fetchCategories();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-5xl font-bold text-orange-600 mb-6">
                Bilgi Yarışması
            </h1>
            <p className="text-lg text-center mb-8 max-w-2xl">
                Bilgi Yarışması, genel kültürünüzü test etmek için harika bir fırsat!
                Farklı kategorilerde sorularla dolu bu yarışmada, en yüksek puanı almak
                için mücadele edin.
            </p>
            <Link href="/quiz/categories">
                <button className="bg-orange-600 text-white font-bold py-3 px-6 rounded shadow-lg hover:bg-orange-500 transition duration-200 mb-10">
                    Yarışmaya Başla
                </button>
            </Link>

            {/* Yarışmanın Özellikleri */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-10 max-w-2xl">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                    Neden Katılmalısınız?
                </h2>
                <p className="text-gray-600 mb-4">
                    Bilgi Yarışması, eğlenceli ve öğretici bir deneyim sunar.
                    Arkadaşlarınızla yarışarak hem eğlenir hem de yeni bilgiler
                    öğrenirsiniz.
                </p>
                <p className="text-gray-600 mb-4">
                    En yüksek puanı alan yarışmacılarımız sürpriz ödüller kazanma şansına
                    sahip!
                </p>
            </div>

            {/* Kategoriler Bölümü */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-10 max-w-2xl">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                    Kategoriler
                </h2>
                <p className="text-gray-600 mb-4">
                    Yarışmamızda çeşitli kategorilerde sorular bulunmaktadır. İşte
                    bazıları:
                </p>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                    {categories.map((category) => (
                        <li key={category.id}>{category.name}</li>
                    ))}
                </ul>
                <p className="text-gray-600 mb-4">
                    Her kategori, farklı zorluk seviyelerinde sorular sunarak bilgi
                    dağarcığınızı genişletmenize yardımcı olur.
                </p>
            </div>

            {/* Lider Tablosu Bölümü */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-10 max-w-2xl">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                    Lider Tablosu
                </h2>
                <p className="text-gray-600 mb-4">
                    Yarışmamızda en yüksek puanı alan yarışmacılar, lider tablosunda yer
                    alır. Kendinizi diğer yarışmacılarla karşılaştırarak ne kadar
                    ilerlediğinizi görebilirsiniz.
                </p>
                <Link href="/leaderboard">
                    <button className="bg-orange-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:bg-orange-500 transition duration-200">
                        Lider Tablosuna Git
                    </button>
                </Link>
            </div>

            {/* İletişim Yönlendirmesi */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-10 max-w-2xl text-center">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">İletişim</h2>
                <p className="text-gray-600 mb-4">
                    Herhangi bir sorunuz veya geri bildiriminiz mi var? Bizimle iletişime
                    geçmek için aşağıdaki butona tıklayın.
                </p>
                <Link href="/dashboard/contact">
                    <button className="bg-orange-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:bg-orange-500 transition duration-200">
                        İletişim Sayfasına Git
                    </button>
                </Link>
            </div>
        </div>
    );
}
