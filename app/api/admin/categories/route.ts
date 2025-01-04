import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError } from "@/lib/errors";
import { checkAdminRole } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Kategori şeması - Zod doğrulama
 * name: Kategori adı (1-100 karakter arası zorunlu)
 */
const categorySchema = z.object({
  name: z.string()
    .min(1, "Kategori adı gereklidir")
    .max(100, "Kategori adı çok uzun")
});

/**
 * GET /api/admin/categories
 * Tüm kategorileri listeler
 * 
 * Veritabanı İşlemleri:
 * - Category tablosundan tüm kayıtları çeker
 * - Her kategori için soru sayısını (_count) hesaplar
 * - name'e göre alfabetik sıralama yapar
 */
export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

    // Kategorileri ve soru sayılarını çek
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Response formatını düzenle
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      questionCount: category._count.questions
    }));

    // Başarılı işlem logu
    logger.info('category', 'list', 'Kategoriler başarıyla listelendi', {
      categoryCount: categories.length
    });

    return apiResponse.success(formattedCategories);

  } catch (error) {
    logger.error('category', error as Error, {
      action: 'list_attempt',
      path: request.url
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }
    return apiResponse.error(
      new APIError("Kategoriler alınırken bir hata oluştu", 500)
    );
  }
}

/**
 * POST /api/admin/categories
 * Yeni kategori oluşturur
 * 
 * Veritabanı İşlemleri:
 * - Category tablosuna yeni kayıt ekler
 * - Benzersiz name constraint'i vardır
 */
export async function POST(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

    // Request body'i doğrula
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    // Kategoriyi oluştur
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
      }
    });

    // Başarılı oluşturma logu
    logger.categoryCreated(category.name, category.id);

    return apiResponse.success({
      message: "Kategori başarıyla oluşturuldu",
      category
    });

  } catch (error) {
    logger.error('category', error as Error, {
      action: 'create',
      errorType: error instanceof z.ZodError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR',
      errorContext: 'create_category'
    });

    if (error instanceof z.ZodError) {
      return apiResponse.error(new ValidationError(error.errors[0].message));
    }

    return apiResponse.error(
      new APIError("Kategori oluşturulurken bir hata oluştu", 500)
    );
  }
}