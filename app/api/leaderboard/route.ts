import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const leaderboard = await prisma.user.findMany({
      where: {
        total_play_count: {
          gt: 0
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
      take: 100
    }).catch((error) => {
      logger.databaseError(error as Error, 'fetch_leaderboard', {
        message: 'Liderlik tablosu getirilirken veritabanı hatası oluştu'
      });
      throw new APIError("Veritabanı hatası", 500, "DATABASE_ERROR");
    });

    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
      return apiResponse.success({ data: [] });
    }

    return apiResponse.success(leaderboard);

  } catch (error) {
    logger.systemError(error as Error, 'fetch_leaderboard', {
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