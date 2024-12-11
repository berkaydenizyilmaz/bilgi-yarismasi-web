import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";

// Validasyon şeması
const quizSchema = z.object({
  userId: z.number(),
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = quizSchema.parse(body);

    const quiz = await prisma.$transaction(async (prisma) => {
      // Quiz'i kaydet
      const savedQuiz = await prisma.quiz.create({
        data: {
          user_id: validatedData.userId,
          category_id: validatedData.categoryId,
          total_questions: validatedData.totalQuestions,
          correct_answers: validatedData.correctAnswers,
          incorrect_answers: validatedData.incorrectAnswers,
          score: validatedData.score,
          user_interactions: {
            create: validatedData.questions.map(question => ({
              user_id: validatedData.userId,
              question_id: question.id,
              seen_at: new Date(),
              answered_at: new Date(),
              is_correct: question.isCorrect,
              user_answer: question.userAnswer
            }))
          }
        }
      });

      // Rank'leri güncelle
      await updateLeaderboardRanks(prisma);

      return savedQuiz;
    });

    return apiResponse.success(quiz, "Quiz başarıyla kaydedildi.", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponse.error(error.errors[0].message);
    }
    console.error("Quiz kaydetme hatası:", error);
    return apiResponse.error("Quiz kaydedilemedi.");
  }
}