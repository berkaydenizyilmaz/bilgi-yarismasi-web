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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = quizSchema.parse(body);

    // Transaction kullanarak hem quiz'i kaydet hem de lider tablosunu güncelle
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

      // Kullanıcı bilgilerini al
      const user = await prisma.user.findUnique({
        where: { id: validatedData.userId },
        select: {
          username: true,
          total_score: true,
          total_play_count: true,
        }
      });

      if (!user) throw new Error("Kullanıcı bulunamadı");

      // Lider tablosunu güncelle veya oluştur
      await prisma.leaderboard.upsert({
        where: { user_id: validatedData.userId },
        create: {
          user_id: validatedData.userId,
          username: user.username,
          total_score: validatedData.score,
          quiz_count: 1,
          average_score: validatedData.score
        },
        update: {
          total_score: { increment: validatedData.score },
          quiz_count: { increment: 1 },
          average_score: {
            set: ((user.total_score + validatedData.score) / (user.total_play_count + 1))
          }
        }
      });

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