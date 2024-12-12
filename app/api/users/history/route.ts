import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, AuthenticationError } from "@/lib/errors";
import jwt from 'jsonwebtoken';
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {

    // Token kontrolü
    const token = request.cookies.get("token")?.value;
    if (!token) {
      throw new AuthenticationError("Oturum bulunamadı");
    }

    // Token'dan userId al
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const userId = decoded.id;

    const quizHistory = await prisma.quiz.findMany({
      where: {
        user_id: userId
      },
      select: {
        id: true,
        total_questions: true,
        correct_answers: true,
        incorrect_answers: true,
        score: true,
        played_at: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        played_at: 'desc'
      },
      take: 10 // Son 10 quiz
    }).catch((error) => {
      logger.error(error as Error, {
        userId,
        message: 'Quiz geçmişi getirilirken veritabanı hatası oluştu'
      });
      throw new APIError("Veritabanı hatası", 500, "DATABASE_ERROR");
    });

    // Quiz geçmişi boş kontrolü
    if (quizHistory.length === 0) {
      return apiResponse.success({ data: [] });
    }

    logger.info('Quiz geçmişi başarıyla getirildi', {
      userId,
      totalQuizzes: quizHistory.length,
      latestQuizDate: quizHistory[0].played_at,
      totalScore: quizHistory.reduce((sum, quiz) => sum + quiz.score, 0)
    });

    return apiResponse.success({
      data: quizHistory.map(quiz => ({
        id: quiz.id,
        categoryName: quiz.category.name,
        totalQuestions: quiz.total_questions,
        correctAnswers: quiz.correct_answers,
        incorrectAnswers: quiz.incorrect_answers,
        score: quiz.score,
        playedAt: quiz.played_at
      }))
    });

  } catch (error) {
    logger.error(error as Error, {
      path: request.url
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Quiz geçmişi getirilirken bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}