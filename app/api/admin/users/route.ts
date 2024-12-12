import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { created_at: "desc" }, // En yeni kullanıcılar önce
    });

    return apiResponse.success({ users });
  } catch (error) {
    return apiResponse.error(new APIError("Kullanıcıları çekerken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR"));
  }
}