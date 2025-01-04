import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { checkAdminRole } from "@/lib/auth";
import { logger } from "@/lib/logger";

/**
 * GET /api/admin/feedbacks
 * Admin paneli için geri bildirimleri listeler
 * 
 * Query Parametreleri:
 * - limit: Sayfa başına gösterilecek geri bildirim sayısı (varsayılan: 10)
 * - offset: Atlanacak geri bildirim sayısı (sayfalama için)
 * 
 * Veritabanı İşlemleri:
 * - Feedback tablosundan sayfalı veri çeker
 * - Oluşturulma tarihine göre azalan sırada listeler
 */
export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Geri bildirimleri ve toplam sayıyı paralel olarak çek
    const [feedback, totalFeedback] = await Promise.all([
      prisma.feedback.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" }
      }),
      prisma.feedback.count()
    ]);

    // Başarılı listeleme logu
    logger.info('feedback', 'list', 'Geri bildirimler listelendi', {
      count: feedback.length,
      total: totalFeedback,
      page: Math.floor(offset / limit) + 1
    });

    return apiResponse.success({ feedback, totalFeedback });

  } catch (error) {
    // Hata logu
    logger.error('feedback', error as Error, {
      action: 'list',
      errorContext: 'list_feedbacks'
    });

    return apiResponse.error(
      new APIError(
        "Geri bildirimleri çekerken bir hata oluştu", 
        500, 
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}