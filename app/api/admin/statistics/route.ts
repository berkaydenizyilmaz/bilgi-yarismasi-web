import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const totalUsers = await prisma.user.count();
    const totalFeedback = await prisma.feedback.count();
    const totalLogs = await prisma.log.count();
    const totalQuizzes = await prisma.quiz.count();

    // Tüm zamanlarda çözülen quizlerin tarihlerini al
    const quizzesByDate = await prisma.quiz.findMany({
      select: {
        played_at: true,
      },
      orderBy: {
        played_at: 'asc'
      }
    });

    // Tarihleri gruplama
    const quizzesCountByDate: Record<string, number> = {};
    quizzesByDate.forEach(quiz => {
      const date = quiz.played_at.toISOString().split('T')[0];
      quizzesCountByDate[date] = (quizzesCountByDate[date] || 0) + 1;
    });

    // Bugünün tarihini al
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Tüm tarihleri sıralı bir şekilde al
    const dates = Object.keys(quizzesCountByDate).sort();

    // Final veriyi oluştur
    const finalQuizzesCountByDate = dates.map(date => ({
      date,
      count: quizzesCountByDate[date]
    }));

    // Kontrol amaçlı log
    console.log('Tarih bazlı quiz sayıları:', quizzesCountByDate);
    console.log('Final quiz sayıları:', finalQuizzesCountByDate);
    console.log('Toplam quiz sayısı:', totalQuizzes);

    // Kategorilerdeki toplam soru sayısını al
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        questions: {
          select: {
            id: true,
          },
        },
      },
    });

    const questionsCountByCategory = categories.map(category => ({
      categoryId: category.id,
      categoryName: category.name,
      questionCount: category.questions.length,
    }));

    // Toplam soru sayısını al
    const totalQuestions = await prisma.question.count();

    return apiResponse.success({
      totalUsers,
      totalFeedback,
      totalLogs,
      totalQuizzes,
      totalQuestions,
      quizzesCountByDate: finalQuizzesCountByDate,
      questionsCountByCategory,
    });
  } catch (error) {
    logger.error('system', error as Error, {
      errorType: 'DATABASE_ERROR',
      errorContext: 'fetch_statistics',
      action: 'list'
    });
    
    return apiResponse.error(
      new APIError("İstatistikler alınırken bir hata oluştu", 500)
    );
  }
}