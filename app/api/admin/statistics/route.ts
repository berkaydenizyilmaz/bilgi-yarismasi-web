import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const totalUsers = await prisma.user.count();
    const totalFeedback = await prisma.feedback.count();
    const totalLogs = await prisma.log.count();

    return apiResponse.success({
      totalUsers,
      totalFeedback,
      totalLogs,
    });
  } catch (error) {
    return apiResponse.error(new APIError("İstatistikleri çekerken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR"));
  }
}