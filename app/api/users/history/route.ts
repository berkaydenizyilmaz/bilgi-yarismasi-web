import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: number;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return apiResponse.error("Yetkilendirme gerekli", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

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
    });

    return apiResponse.success(quizHistory);
  } catch (error) {
    console.error("Quiz geçmişi alma hatası:", error);
    return apiResponse.error("Quiz geçmişi alınamadı");
  }
} 