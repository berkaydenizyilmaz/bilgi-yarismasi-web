import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import * as bcrypt from "bcrypt"
import * as z from "zod"
import { signJWT } from "@/lib/jwt"

// Validasyon şeması
const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
})

export async function POST(request: NextRequest) {
  try {
    // Request body'i al ve validate et
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Email veya şifre hatalı." },
        { status: 400 }
      )
    }

    // Şifreleri karşılaştır
    const passwordMatch = await bcrypt.compare(
      validatedData.password,
      user.password_hash
    )

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Email veya şifre hatalı." },
        { status: 400 }
      )
    }

    // JWT token oluştur
    const token = signJWT({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    // Response'u hazırla
    const response = NextResponse.json({
      message: "Giriş başarılı.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })

    // Token'ı cookie'ye ekle
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 gün
    });

    return response

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu." },
      { status: 500 }
    )
  }
} 