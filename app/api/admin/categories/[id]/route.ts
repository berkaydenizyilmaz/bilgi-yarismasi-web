import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError } from "@/lib/errors";
import { checkAdminRole } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Kategori güncelleme şeması
 */
const categorySchema = z.object({
  name: z.string()
    .min(1, "Kategori adı gereklidir")
    .max(100, "Kategori adı çok uzun")
});

/**
 * PUT /api/admin/categories/[id]
 * Kategori bilgilerini günceller
 * 
 * Veritabanı İşlemleri:
 * - Category tablosunda id'ye göre güncelleme yapar
 * - Güncel soru sayısını döner
 */

// @ts-ignore
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

    // ID parametresini doğrula
    const id = parseInt(context.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Geçersiz kategori ID'si");
    }

    // Request body'i doğrula
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    // Kategoriyi güncelle ve soru sayısını al
    const category = await prisma.category.update({
      where: { id },
      data: { name: validatedData.name },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    // Başarılı güncelleme logu
    logger.categoryUpdated(category.name, category.id);

    return apiResponse.success({
      id: category.id,
      name: category.name,
      questionCount: category._count.questions
    });

  } catch (error) {
    logger.error('category', error as Error, {
      action: 'update',
      categoryId: context.params.id,
      errorType: error instanceof z.ZodError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR'
    });

    if (error instanceof z.ZodError) {
      return apiResponse.error(new ValidationError(error.errors[0].message));
    }

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError("Kategori güncellenirken bir hata oluştu", 500)
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Kategoriyi siler
 * 
 * Veritabanı İşlemleri:
 * - Category tablosundan kaydı siler
 * - Kategoriye bağlı sorular da silinir (cascade)
 */

// @ts-ignore
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

    // ID parametresini doğrula
    const id = parseInt(context.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Geçersiz kategori ID'si");
    }

    // Silinecek kategoriyi bul
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new APIError("Kategori bulunamadı", 404);
    }

    // Kategoriyi sil
    await prisma.category.delete({
      where: { id }
    });

    // Başarılı silme logu
    logger.categoryDeleted(category.name, category.id);

    return apiResponse.success({
      message: "Kategori başarıyla silindi"
    });

  } catch (error) {
    logger.error('category', error as Error, {
      action: 'delete',
      categoryId: context.params.id
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError("Kategori silinirken bir hata oluştu", 500)
    );
  }
}
