"use client"

import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header"; 
import Footer from "@/components/Footer"; 
import { usePathname } from "next/navigation";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname(); // Sayfa yolunu al

    // Eğer auth sayfasındaysak Header ve Footer'ı gizle
    const isAuthPage = pathname.startsWith("/auth");

    return (
        <html lang="en">
          <body>
            <div className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
                {/* Eğer auth sayfasında değilsek Header'ı göster */}
                {!isAuthPage && <Header />} 
                <main className="flex-grow"> {/* Ana içerik alanı */}
                    {children} {/* Sayfa içeriği */}
                </main>
            </div>
            {/* Eğer auth sayfasında değilsek Footer'ı göster */}
            {!isAuthPage && <Footer />} 
            </body>
        </html>
    );
}