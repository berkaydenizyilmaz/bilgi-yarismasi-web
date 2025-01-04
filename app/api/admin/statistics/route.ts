import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { checkAdminRole } from "@/lib/auth";
import { logger } from "@/lib/logger";

/**
 * GET /api/admin/statistics
 * Admin paneli için istatistikleri getirir
 * 
 * Veritabanı İşlemleri:
 * 1. Genel İstatistikler:
 *    - Toplam kullanıcı sayısı (User tablosu)
 *    - Toplam geri bildirim sayısı (Feedback tablosu)
 *    - Toplam log sayısı (Log tablosu)
 *    - Toplam quiz sayısı (Quiz tablosu)
 *    - Toplam soru sayısı (Question tablosu)
 * 
 * 2. Quiz İstatistikleri:
 *    - Tarihe göre quiz çözülme sayıları
 *    - Quiz tablosundan played_at'e göre gruplandırma
 * 
 * 3. Kategori İstatistikleri:
 *    - Her kategorideki soru sayısı
 *    - Category ve Question tabloları arası ilişki
 */
export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

    // Genel istatistikleri paralel olarak çek
    const [
      totalUsers,
      totalFeedback,
      totalLogs,
      totalQuizzes,
      totalQuestions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.feedback.count(),
      prisma.log.count(),
      prisma.quiz.count(),
      prisma.question.count()
    ]);

    // Quiz tarih istatistiklerini al
    const quizzesByDate = await prisma.quiz.findMany({
      select: {
        played_at: true,
      },
      orderBy: {
        played_at: 'asc'
      }
    });

    // Tarihlere göre quiz sayılarını grupla
    const quizzesCountByDate: Record<string, number> = {};
    quizzesByDate.forEach(quiz => {
      const date = quiz.played_at.toISOString().split('T')[0];
      quizzesCountByDate[date] = (quizzesCountByDate[date] || 0) + 1;
    });

    // Tarihleri sırala ve final veriyi oluştur
    const dates = Object.keys(quizzesCountByDate).sort();
    const finalQuizzesCountByDate = dates.map(date => ({
      date,
      count: quizzesCountByDate[date]
    }));

    // Kategori bazlı soru sayılarını al
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

    // Başarılı işlem logu
    logger.info('system', 'list', 'İstatistikler başarıyla çekildi', {
      totalUsers,
      totalQuizzes,
      totalQuestions,
      categoryCount: categories.length
    });

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
    // Hata logu
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