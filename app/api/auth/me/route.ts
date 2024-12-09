import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/jwt"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "Yetkilendirme hatası" },
        { status: 401 }
      )
    }

    const decoded = verifyJWT(token) as { id: string }
    const user = await prisma.user.findUnique({
        where: { id: parseInt(decoded.id) },
        select: {
          id: true,
        username: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      { error: "Yetkilendirme hatası" },
      { status: 401 }
    )
  }
}