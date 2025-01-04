import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { checkAdminRole } from "@/lib/auth";
import { logger } from "@/lib/logger";

/**
 * GET /api/admin/logs
 * Sistem loglarını listeler (sadece adminler için)
 * 
 * Query Parametreleri:
 * - page: Sayfa numarası (varsayılan: 1)
 * - pageSize: Sayfa başına log sayısı (varsayılan: 10)
 * 
 * Veritabanı İşlemleri:
 * - Log tablosundan sayfalı veri çeker
 * - İlişkili kullanıcı bilgilerini getirir
 * - Zaman damgasına göre azalan sırada listeler
 */
export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

    // Sayfalama parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    // Logları ve toplam sayıyı paralel olarak çek
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
    
    // Log listeleme işleminin kendisini logla
    logger.info('system', 'list', 'Sistem logları görüntülendi', {
      page,
      pageSize,
      totalLogs: total
    });

    // API yanıtını hazırla
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
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });

  } catch (error) {
    // Hata logu
    logger.error('system', error as Error, {
      action: 'list_logs',
      errorContext: 'admin_logs'
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Loglar çekilirken bir hata oluştu", 
        500, 
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}