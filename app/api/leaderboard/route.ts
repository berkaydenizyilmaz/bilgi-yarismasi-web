import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";

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
    });

    // Sıralamaları güncelle
    for (let i = 0; i < users.length; i++) {
      await prisma.leaderboard.upsert({
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
        total_play_count: true
      },
      orderBy: {
        total_score: 'desc'
      },
      take: 100
    });

    const formattedLeaderboard = leaderboard.map((user: {
      username: string;
      total_score: number;
      total_play_count: number;
    }, index: number) => ({
      username: user.username,
      total_score: user.total_score,
      quiz_count: user.total_play_count,
      average_score: user.total_play_count > 0 
        ? Math.round((user.total_score / user.total_play_count)) 
        : 0,
      rank: index + 1
    }));

    return apiResponse.success(formattedLeaderboard);
  } catch (error) {
    console.error("Lider tablosu alma hatası:", error);
    return apiResponse.error("Lider tablosu alınamadı");
  }
}