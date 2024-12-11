import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    // Önce sıralamayı güncelle
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
    }).catch((error) => {
      console.error("Users fetch error:", error);
      throw new APIError("Kullanıcı listesi alınamadı", 500, "DATABASE_ERROR");
    });

    // Sıralamaları güncelle - transaction kullan
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < users.length; i++) {
        await tx.leaderboard.upsert({
          where: { 
            user_id: users[i].id 
          },
          create: {
            user_id: users[i].id,
            rank: i + 1
          },
          update: {
            rank: i + 1
          }
        });
      }
    }).catch((error) => {
      console.error("Leaderboard update error:", error);
      throw new APIError("Sıralama güncellenemedi", 500, "DATABASE_ERROR");
    });

    // Güncellenmiş lider tablosunu getir
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
        total_score: 'desc'
      },
      take: 100
    }).catch((error) => {
      console.error("Leaderboard fetch error:", error);
      throw new APIError("Lider tablosu alınamadı", 500, "DATABASE_ERROR");
    });

    const formattedLeaderboard = leaderboard.map((user) => ({
      username: user.username,
      total_score: user.total_score,
      quiz_count: user.total_play_count,
      average_score: user.total_play_count > 0 
        ? Math.round((user.total_score / user.total_play_count)) 
        : 0,
      rank: user.leaderboard?.rank ?? 0
    }));

    return apiResponse.success(formattedLeaderboard);

  } catch (error) {
    console.error("Leaderboard error:", error);

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Lider tablosu alınırken beklenmeyen bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}