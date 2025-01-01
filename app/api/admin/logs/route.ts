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
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    // Toplam log sayısı ve sayfalı logları al
    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        orderBy: { timestamp: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.log.count()
    ]);

    return apiResponse.success({ 
      logs,
      total,
      page,
      pageSize
    });
  } catch (error) {
    return apiResponse.error(
      new APIError("Loglar çekilirken bir hata oluştu", 500)
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