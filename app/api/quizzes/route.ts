import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import { APIError, ValidationError, AuthenticationError } from "@/lib/errors";
import jwt from 'jsonwebtoken';

// Validasyon şeması
const quizSchema = z.object({
  categoryId: z.number(),
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  incorrectAnswers: z.number(),
  score: z.number(),
  questions: z.array(z.object({
    id: z.number(),
    isCorrect: z.boolean(),
    userAnswer: z.string()
  }))
});

async function updateLeaderboardRanks(prisma: any) {
  try {
    const users = await prisma.user.findMany({
      where: {
        total_play_count: {
          gt: 0
        }
      },
      orderBy: {
        total_score: 'desc'
      },
      select: {
        id: true
      }
    });

    for (let i = 0; i < users.length; i++) {
      await prisma.leaderboard.upsert({
        where: { user_id: users[i].id },
        create: {
          user_id: users[i].id,
          rank: i + 1
        },
        update: {
          rank: i + 1
        }
      });
    }
  } catch (error) {
    console.error("Leaderboard update error:", error);
    throw new APIError("Lider tablosu güncellenirken hata oluştu", 500, "LEADERBOARD_ERROR");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Token kontrolü
    const token = request.cookies.get("token")?.value;
    if (!token) {
      throw new AuthenticationError();
    }

    // Token'dan kullanıcı bilgisini al
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    
    // Request body'yi parse et
    let body;
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError("Geçersiz istek formatı");
    }

    // Validasyon
    try {
      quizSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.errors[0].message);
      }
      throw error;
    }

    // Transaction başlat
    const result = await prisma.$transaction(async (tx) => {
      // Quiz kaydını oluştur
      const quiz = await tx.quiz.create({
        data: {
          user_id: decoded.id,
          category_id: body.categoryId,
          total_questions: body.totalQuestions,
          correct_answers: body.correctAnswers,
          incorrect_answers: body.incorrectAnswers,
          score: body.score,
          played_at: new Date(),
        }
      });

      // Soru cevaplarını kaydet
      await tx.userQuestionInteraction.createMany({
        data: body.questions.map((q: any) => ({
          quiz_id: quiz.id,
          question_id: q.id,
          user_answer: q.userAnswer,
          is_correct: q.isCorrect
        }))
      });

      // Kullanıcı istatistiklerini güncelle
      await tx.user.update({
        where: { id: decoded.id },
        data: {
          total_score: { increment: body.score },
          total_play_count: { increment: 1 },
          total_questions_attempted: { increment: body.totalQuestions },
          total_correct_answers: { increment: body.correctAnswers }
        }
      });

      return quiz;
    }).catch((error) => {
      console.error("Transaction error:", error);
      throw new APIError("Quiz kaydedilirken bir hata oluştu", 500, "DATABASE_ERROR");
    });

    // Lider tablosunu güncelle
    await updateLeaderboardRanks(prisma);

    return apiResponse.success({
      quizId: result.id,
      message: "Quiz başarıyla kaydedildi"
    });

  } catch (error) {
    console.error("Quiz submission error:", error);

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Quiz kaydedilirken beklenmeyen bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}