import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import * as bcrypt from "bcrypt"
import * as z from "zod"

// Validasyon şeması
const registerSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
  email: z.string().email("Geçerli bir email adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
})

export async function POST(request: NextRequest) {
  try {
    // Request body'i al ve validate et
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Email ve username kontrolü
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return NextResponse.json(
          { error: "Bu email adresi zaten kullanımda." },
          { status: 400 }
        )
      }
      if (existingUser.username === validatedData.username) {
        return NextResponse.json(
          { error: "Bu kullanıcı adı zaten kullanımda." },
          { status: 400 }
        )
      }
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password_hash: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
      },
    })

    return NextResponse.json({
      message: "Kullanıcı başarıyla oluşturuldu.",
      user,
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu." },
      { status: 500 }
    )
  }
} 