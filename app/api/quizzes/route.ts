import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import { APIError, ValidationError, AuthenticationError } from "@/lib/errors";
import jwt from 'jsonwebtoken';
import { logger } from "@/lib/logger";

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
  let body: z.infer<typeof quizSchema> | undefined;

  try {

    // Token kontrolü
    const token = request.cookies.get("token")?.value;
    if (!token) {
      throw new AuthenticationError("Oturum bulunamadı");
    }

    // Token'dan userId al
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const userId = decoded.id;  // Artık kesin olarak bir number

    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError("Geçersiz istek formatı");
    }

    // Validasyon
    quizSchema.parse(body);
    const validatedBody = body as z.infer<typeof quizSchema>;

    // Quiz sonuçlarını kaydet
    const quiz = await prisma.quiz.create({
      data: {
        user_id: userId,
        category_id: validatedBody.categoryId,
        total_questions: validatedBody.totalQuestions,
        correct_answers: validatedBody.correctAnswers,
        incorrect_answers: validatedBody.incorrectAnswers,
        score: validatedBody.score,
        user_interactions: {
          create: validatedBody.questions.map(q => ({
            user_id: userId,  // Artık kesin olarak number
            question_id: q.id,
            is_correct: q.isCorrect,
            user_answer: q.userAnswer
          }))
        }
      }
    });

    // Kullanıcı istatistiklerini güncelle
    await prisma.user.update({
      where: { id: userId },
      data: {
        total_play_count: { increment: 1 },
        total_score: { increment: validatedBody.score },
        total_questions_attempted: { increment: validatedBody.totalQuestions },
        total_correct_answers: { increment: validatedBody.correctAnswers }
      }
    });

    // Liderlik tablosunu güncelle
    await updateLeaderboardRanks(prisma);

    logger.info('Quiz sonuçları başarıyla kaydedildi', {
      userId,
      quizId: quiz.id,
      categoryId: validatedBody.categoryId,
      score: validatedBody.score
    });

    return apiResponse.success({
      message: "Quiz sonuçları kaydedildi",
      data: { quizId: quiz.id }
    });

  } catch (error) {
    logger.error(error as Error, {
      path: request.url,
      categoryId: body?.categoryId
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Quiz sonuçları kaydedilirken bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}