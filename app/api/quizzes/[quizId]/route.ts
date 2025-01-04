import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError, AuthenticationError } from "@/lib/errors";
import jwt from 'jsonwebtoken';
import { logger } from "@/lib/logger";

/**
 * JWT token içeriği için tip tanımı
 */
interface JWTPayload {
    id: number;
}

/**
 * GET /api/quizzes/[quizId]
 * Quiz detaylarını getirir
 * 
 * Path Parametreleri:
 * - quizId: Quiz ID'si
 * 
 * Veritabanı İşlemleri:
 * 1. Quiz tablosundan detayları çeker
 * 2. İlişkili kategori bilgisini getirir
 * 3. Quiz'deki tüm soru etkileşimlerini getirir
 * 4. Her soru için detayları ve kullanıcı cevaplarını birleştirir
 * 
 * İlişkiler:
 * - category: Quiz'in kategorisi
 * - user_interactions: Quiz'deki soru-cevap kayıtları
 * - question: Her etkileşimin bağlı olduğu soru
 */
export async function GET(req: NextRequest, { params }: any) {
  try {
    // Token kontrolü
    const token = req.cookies.get("token")?.value;
    if (!token) {
      throw new AuthenticationError();
    }

    // Token'dan kullanıcı bilgisini al
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
      logger.error('auth', error as Error, {
        action: 'auth',
        errorType: 'TOKEN_ERROR',
        errorContext: 'verify_token'
      });
      throw new AuthenticationError("Geçersiz veya süresi dolmuş oturum");
    }

    // Quiz ID validasyonu
    const quizId = parseInt(params.quizId);
    if (isNaN(quizId)) {
      throw new ValidationError("Geçersiz Quiz ID");
    }

    // Quiz'i ve ilişkili verileri getir
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        user_id: decoded.id // Sadece kullanıcının kendi quizleri
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        user_interactions: {
          include: {
            question: {
              select: {
                question_text: true,
                correct_option: true,
                option_a: true,
                option_b: true,
                option_c: true,
                option_d: true,
              }
            }
          }
        }
      },
    }).catch((error) => {
      logger.error('quiz', error as Error, {
        action: 'get',
        quizId,
        userId: decoded.id,
        errorType: 'DATABASE_ERROR'
      });
      throw new APIError("Quiz bilgileri alınamadı", 500, "DATABASE_ERROR");
    });

    if (!quiz) {
      logger.warn('quiz', 'list', 'Quiz bulunamadı', { quizId, userId: decoded.id });
      return NextResponse.json(apiResponse.error(new APIError("Quiz bulunamadı", 404, "NOT_FOUND")));
    }

    // Quiz verilerini formatla
    const formattedQuiz = {
      ...quiz,
      questions: quiz.user_interactions.map(interaction => ({
        question: interaction.question.question_text,
        userAnswer: interaction.user_answer,
        correctAnswer: interaction.question.correct_option,
        isCorrect: interaction.is_correct,
        options: {
          A: interaction.question.option_a,
          B: interaction.question.option_b,
          C: interaction.question.option_c,
          D: interaction.question.option_d,
        }
      }))
    };

    // Başarılı sorgu logu
    logger.info('quiz', 'list', 'Quiz detayları getirildi', {
      quizId,
      userId: decoded.id,
      categoryName: quiz.category.name,
      questionCount: quiz.user_interactions.length
    });

    return apiResponse.success(formattedQuiz);

  } catch (error) {
    logger.error('quiz', error as Error, {
      action: 'get',
      path: req.url,
      quizId: params.quizId,
      errorType: error instanceof APIError ? error.code : 'INTERNAL_ERROR'
    });

    return NextResponse.json(
      apiResponse.error(
        error instanceof APIError ? error : new APIError("Beklenmedik bir hata oluştu", 500)
      )
    );
  }
}

