import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * GET /api/leaderboard
 * Liderlik tablosunu getirir
 * 
 * Veritabanı İşlemleri:
 * 1. User tablosundan en yüksek skorlu kullanıcıları çeker
 * 2. En az 1 quiz çözmüş kullanıcıları filtreler
 * 3. Leaderboard tablosundaki sıralamaya göre listeler
 * 4. İlk 100 kullanıcıyı döner
 * 
 * Response:
 * - username: Kullanıcı adı
 * - total_score: Toplam puan
 * - total_play_count: Toplam oyun sayısı
 * - rank: Sıralama
 */
export async function GET(request: NextRequest) {
  try {
    // Liderlik tablosunu getir
    const leaderboard = await prisma.user.findMany({
      where: {
        total_play_count: {
          gt: 0 // En az 1 quiz çözmüş olanlar
        }
      },
      select: {
        username: true,
        total_score: true,
        total_play_count: true,
        leaderboard: {
          select: {
            rank: true
          }
        }
      },
      orderBy: {
        leaderboard: {
          rank: 'asc'
        }
      },
      take: 100 // İlk 100 kullanıcı
    }).catch((error) => {
      logger.error('leaderboard', error as Error, {
        action: 'list',
        errorType: 'DATABASE_ERROR',
        errorContext: 'fetch_leaderboard'
      });
      throw new APIError("Veritabanı hatası", 500, "DATABASE_ERROR");
    });

    // Boş kontrol
    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
      logger.info('system', 'list', 'Boş liderlik tablosu döndürüldü');
      return apiResponse.success({ data: [] });
    }

    // Başarılı listeleme logu
    logger.info('system', 'list', 'Liderlik tablosu getirildi', {
      userCount: leaderboard.length,
      topScore: leaderboard[0]?.total_score || 0
    });

    return apiResponse.success(leaderboard);

  } catch (error) {
    logger.error('system', error as Error, {
      action: 'list',
      path: request.url,
      errorType: error instanceof APIError ? 'DATABASE_ERROR' : 'INTERNAL_ERROR',
      errorContext: 'fetch_leaderboard'
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Liderlik tablosu getirilirken bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}