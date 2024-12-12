import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    logger.request(request);

    const leaderboard = await prisma.user.findMany({
      where: {
        total_play_count: {
          gt: 0  // Sadece en az 1 quiz çözmüş kullanıcıları getir
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
      logger.error(error as Error, {
        message: 'Liderlik tablosu getirilirken veritabanı hatası oluştu'
      });
      throw new APIError("Veritabanı hatası", 500, "DATABASE_ERROR");
    });

    // Liderlik tablosu boş kontrolü
    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
      logger.warn('Liderlik tablosu boş');
      return apiResponse.success({ data: [] });
    }

    logger.info('Liderlik tablosu başarıyla getirildi', {
      totalUsers: leaderboard.length,
      topScore: leaderboard[0]?.total_score,
      lastRank: leaderboard[leaderboard.length - 1]?.leaderboard?.rank
    });

    return apiResponse.success(leaderboard);

  } catch (error) {
    logger.error(error as Error, {
      path: request.url
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