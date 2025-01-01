import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const totalUsers = await prisma.user.count();
    const totalFeedback = await prisma.feedback.count();
    const totalLogs = await prisma.log.count();
    const totalQuizzes = await prisma.quiz.count();

    // Tüm zamanlarda çözülen quizlerin tarihlerini al
    const quizzesByDate = await prisma.quiz.findMany({
      where: {},
      select: {
        played_at: true,
      },
    });

    // Tarihleri gruplama
    const quizzesCountByDate: Record<string, number> = {};
    quizzesByDate.forEach(quiz => {
      const date = quiz.played_at.toISOString().split('T')[0]; // YYYY-MM-DD formatı
      quizzesCountByDate[date] = (quizzesCountByDate[date] || 0) + 1; // Güncellenmiş nesne
    });

    // Tüm tarihleri sıralama
    const allDates = Object.keys(quizzesCountByDate).sort(); // Tüm tarihleri al ve sıralama

    // Tüm tarih aralığını oluşturma
    const startDate = new Date(Math.min(...quizzesByDate.map(q => q.played_at.getTime())));
    const endDate = new Date(Math.max(...quizzesByDate.map(q => q.played_at.getTime())));
    const dateRange = [];
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      dateRange.push(d.toISOString().split('T')[0]); // YYYY-MM-DD formatı
    }

    // Eksik tarihler için 0 değeri ekleme
    const finalQuizzesCountByDate = dateRange.map(date => ({
      date,
      count: quizzesCountByDate[date] || 0, // Eğer tarih yoksa 0 ata
    }));

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
    return apiResponse.error(new APIError("İstatistikler alınırken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR"));
  }
}