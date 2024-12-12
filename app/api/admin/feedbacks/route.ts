import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const feedback = await prisma.feedback.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    const totalFeedback = await prisma.feedback.count();

    return apiResponse.success({ feedback, totalFeedback });
  } catch (error) {
    return apiResponse.error(new APIError("Geri bildirimleri çekerken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR"));
  }
}