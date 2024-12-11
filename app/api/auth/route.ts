import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import jwt from 'jsonwebtoken';
import { APIError, AuthenticationError } from "@/lib/errors";

interface JWTPayload {
  id: number;
  email: string;
  username: string;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      throw new AuthenticationError("Oturum bulunamadı");
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
      throw new AuthenticationError("Geçersiz veya süresi dolmuş oturum");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        total_play_count: true,
        total_score: true,
        created_at: true,
      },
    }).catch((error) => {
      console.error("Database error:", error);
      throw new APIError("Veritabanı hatası", 500, "DATABASE_ERROR");
    });

    if (!user) {
      throw new AuthenticationError("Kullanıcı bulunamadı");
    }

    return apiResponse.success({ user });

  } catch (error) {
    console.error("Auth check error:", error);

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Oturum kontrolü sırasında bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}