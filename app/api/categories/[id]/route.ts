import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * GET /api/categories/[id]
 * Belirli bir kategorinin detaylarını getirir
 * 
 * Path Parametreleri:
 * - id: Kategori ID'si
 * 
 * Veritabanı İşlemleri:
 * - Category tablosundan ID'ye göre tekil kayıt çeker
 * - Sadece name alanını seçer
 */

//@ts-ignore
export async function GET(
  request: NextRequest,
  params: any
) {
  try {
    const id = Number(params.id);
    
    if (isNaN(id)) {
      logger.warn('category', 'list', 'Geçersiz kategori ID', { id: params.id });
      throw new APIError("Geçersiz kategori ID", 400);
    }

    // Kategoriyi bul
    const category = await prisma.category.findUnique({
      where: { id },
      select: { name: true }
    });

    if (!category) {
      logger.warn('category', 'list', 'Kategori bulunamadı', { categoryId: id });
      throw new APIError("Kategori bulunamadı", 404);
    }

    // Başarılı işlem logu
    logger.info('category', 'list', 'Kategori detayı getirildi', {
      categoryId: id,
      categoryName: category.name
    });

    return apiResponse.success(category);

  } catch (error) {
    logger.error('category', error as Error, {
      action: 'list',
      categoryId: params.id,
      errorType: error instanceof APIError ? 'NOT_FOUND' : 'DATABASE_ERROR'
    });

    return apiResponse.error(
      error instanceof APIError ? error : new APIError("Beklenmeyen bir hata oluştu", 500)
    );
  }
}