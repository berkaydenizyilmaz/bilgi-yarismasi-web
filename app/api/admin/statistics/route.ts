import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    // Toplam kullanıcı sayısını al
    const totalUsers = await prisma.user.count();

    // Toplam geri bildirim sayısını al
    const totalFeedback = await prisma.feedback.count();

    // Toplam log sayısını al
    const totalLogs = await prisma.log.count();

    // İstatistikleri döndür
    return apiResponse.success({
      totalUsers,
      totalFeedback,
      totalLogs,
    });
  } catch (error) {
    return apiResponse.error(new APIError("İstatistikler alınırken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR"));
  }
}