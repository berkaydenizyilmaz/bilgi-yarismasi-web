import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import jwt from 'jsonwebtoken';
import { APIError, AuthenticationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

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
        total_correct_answers: true,
        total_questions_attempted: true,
        created_at: true,
      },
    }).catch((error) => {
      logger.error(error as Error, {
        userId: decoded.id,
        email: decoded.email
      });
      throw new APIError("Veritabanı hatası", 500, "DATABASE_ERROR");
    });

    if (!user) {
      throw new AuthenticationError("Kullanıcı bulunamadı");
    }

    return apiResponse.success({ user });

  } catch (error) {
    logger.error(error as Error, {
      path: request.url
    });

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