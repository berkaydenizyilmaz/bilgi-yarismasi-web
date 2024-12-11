import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import jwt from 'jsonwebtoken';
import { APIError, AuthenticationError } from "@/lib/errors";

interface JWTPayload {
  id: number;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      throw new AuthenticationError();
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
      throw new AuthenticationError("Geçersiz veya süresi dolmuş oturum");
    }

    const quizHistory = await prisma.quiz.findMany({
      where: { user_id: decoded.id },
      select: {
        id: true,
        category: {
          select: {
            name: true
          }
        },
        score: true,
        correct_answers: true,
        total_questions: true,
        played_at: true
      },
      orderBy: {
        played_at: 'desc'
      },
      take: 10
    }).catch((error) => {
      console.error("Database error:", error);
      throw new APIError("Quiz geçmişi alınamadı", 500, "DATABASE_ERROR");
    });

    return apiResponse.success(quizHistory);
    
  } catch (error) {
    console.error("Quiz history error:", error);

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Quiz geçmişi alınırken beklenmeyen bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}