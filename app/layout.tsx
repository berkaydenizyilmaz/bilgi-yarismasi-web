"use client"

import localFont from "next/font/local"
import "./globals.css"
import Header from "@/components/Header"
import { AuthProvider } from "@/contexts/AuthContext"
import { usePathname } from "next/navigation"
import Footer from "@/components/Footer"
import { Providers } from './providers';
import { Toaster } from "@/components/ui/toaster"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth/')
  const isAdminPage = pathname.startsWith('/admin')

  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <AuthProvider>
          <Providers>
            <div className="flex flex-col min-h-screen">
              {!isAuthPage && !isAdminPage && <Header />}
              <main className="flex-grow">
                {children}
                <Toaster />
              </main>
              {!isAuthPage && !isAdminPage && <Footer />}
            </div>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}