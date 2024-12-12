import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError } from "@/lib/errors";
import jwt from 'jsonwebtoken';
import { logger } from "@/lib/logger";

const QUESTIONS_PER_QUIZ = 10;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {

    // URL parametrelerini al ve kontrol et
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      throw new ValidationError("Kategori ID'si belirtilmedi");
    }

    // Token kontrolü
    const token = request.cookies.get("token")?.value;
    if (!token) {
      throw new ValidationError("Oturum bulunamadı");
    }

    // Token'dan kullanıcı bilgisini al
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const userId = decoded.id;

    // Kategori kontrolü
    const category = await prisma.category.findUnique({
      where: { id: Number(categoryId) }
    }).catch((error) => {
      logger.error(error as Error, {
        categoryId,
        message: 'Kategori bilgisi alınamadı'
      });
      throw new APIError("Kategori bilgisi alınamadı", 500, "DATABASE_ERROR");
    });

    if (!category) {
      throw new ValidationError("Geçersiz kategori");
    }

    // Cevaplanmamış soru sayısını kontrol et
    const totalUnansweredQuestions = await prisma.question.count({
      where: {
        category_id: Number(categoryId),
        NOT: {
          user_interactions: {
            some: {
              user_id: userId,
              quiz_id: { not: null }
            }
          }
        }
      }
    }).catch((error) => {
      logger.error(error as Error, {
        categoryId,
        userId,
        message: 'Soru sayısı alınamadı'
      });
      throw new APIError("Soru sayısı alınamadı", 500, "DATABASE_ERROR");
    });

    if (totalUnansweredQuestions < QUESTIONS_PER_QUIZ) {
      throw new APIError(
        `Bu kategoride sadece ${totalUnansweredQuestions} adet cevaplanmamış soru kaldı.`,
        404,
        "INSUFFICIENT_QUESTIONS"
      );
    }

    // Soruları getir
    const questions = await prisma.question.findMany({
      where: {
        category_id: Number(categoryId),
        NOT: {
          user_interactions: {
            some: {
              user_id: userId,
              quiz_id: { not: null }
            }
          }
        }
      },
      select: {
        id: true,
        question_text: true,
        option_a: true,
        option_b: true,
        option_c: true,
        option_d: true,
        correct_option: true,
      },
      take: QUESTIONS_PER_QUIZ,
      orderBy: {
        id: 'asc'
      }
    }).catch((error) => {
      logger.error(error as Error, {
        categoryId,
        userId,
        message: 'Sorular alınamadı'
      });
      throw new APIError("Sorular alınamadı", 500, "DATABASE_ERROR");
    });

    return apiResponse.success(questions);

  } catch (error) {
    logger.error(error as Error, {
      path: request.url,
      categoryId: searchParams.get("categoryId")
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Sorular alınırken beklenmeyen bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}