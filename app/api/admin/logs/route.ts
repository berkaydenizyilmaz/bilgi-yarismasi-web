import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import { APIError, ValidationError, AuthenticationError } from "@/lib/errors";
import { checkAdminRole } from "@/lib/auth";

// Log verisi için Zod şeması
const logSchema = z.object({
  level: z.enum(['info', 'warn', 'error']),
  message: z.string(),
  timestamp: z.string().datetime(),
  path: z.string().optional(),
  userId: z.number().optional(),
  error: z.any().optional(),
  metadata: z.record(z.any()).optional()
});

export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const level = searchParams.get("level");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Filtreleme koşulları
    const where: any = {};
    if (level) where.level = level;
    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          level: true,
          message: true,
          timestamp: true,
          path: true,
          user_id: true,
          error: true,
          metadata: true
        }
      }),
      prisma.log.count({ where })
    ]);

    return apiResponse.successWithPagination(
      { logs },
      total,
      page,
      limit
    );

  } catch (error) {
    console.error('Log getirme hatası:', error);
    if (error instanceof APIError) {
      return apiResponse.error(error);
    }
    return apiResponse.error(
      new APIError("Loglar alınırken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR")
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

    let body: z.infer<typeof logSchema>;
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError("Geçersiz istek formatı");
    }

    // Zod validasyonu
    try {
      logSchema.parse(body);
    } catch (error) {
      throw new ValidationError("Geçersiz log verisi");
    }

    const log = await prisma.log.create({
      data: {
        level: body.level,
        message: body.message,
        timestamp: new Date(body.timestamp),
        path: body.path,
        user_id: body.userId,
        error: body.error,
        metadata: body.metadata,
      },
    });

    return apiResponse.success({
      message: "Log başarıyla kaydedildi",
      logId: log.id
    });
  } catch (error) {
    if (error instanceof APIError) {
      return apiResponse.error(error);
    }
    return apiResponse.error(
      new APIError("Log kaydedilirken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR")
    );
  }
}