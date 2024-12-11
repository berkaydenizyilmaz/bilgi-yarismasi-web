import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const leaderboard = await prisma.leaderboard.findMany({
      orderBy: [
        { total_score: 'desc' }
      ],
      take: 100,
      select: {
        username: true,
        total_score: true,
        quiz_count: true,
        average_score: true
      }
    });

    return apiResponse.success(leaderboard);
  } catch (error) {
    console.error("Lider tablosu alma hatası:", error);
    return apiResponse.error("Lider tablosu alınamadı");
  }
}