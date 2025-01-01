import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { checkAdminRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    // Debug için log ekleyelim
    console.log('Fetching logs with params:', { page, pageSize, skip });

    // Toplam log sayısı ve sayfalı logları al
    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        orderBy: { timestamp: "desc" },
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              username: true
            }
          }
        }
      }),
      prisma.log.count()
    ]);
    
    // API yanıtını düzeltelim
    return apiResponse.success({
      logs: logs.map(log => ({
        id: log.id,
        level: log.level,
        module: log.module,
        action: log.action,
        message: log.message,
        timestamp: log.timestamp,
        path: log.path,
        user_id: log.user_id,
        error: log.error,
        metadata: log.metadata,
        username: log.user?.username
      })),
      total,
      page,
      pageSize
    });

  } catch (error) {
    console.error('Log getirme hatası:', error);
    if (error instanceof APIError) {
      return apiResponse.error(error);
    }
    return apiResponse.error(
      new APIError("Loglar çekilirken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR")
    );
  }
}