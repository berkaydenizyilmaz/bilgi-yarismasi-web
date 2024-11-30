import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Response oluştur
    const response = NextResponse.json({
      message: "Çıkış başarılı.",
    })

    // Token cookie'sini sil
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: true,
      path: "/",
      expires: new Date(0), // Geçmiş bir tarih ile cookie'yi sil
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu." },
      { status: 500 }
    )
  }
} 