import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    }).catch((error) => {
      logger.error('category', error as Error, {
        action: 'list',
        errorType: 'DATABASE_ERROR',
        errorContext: 'fetch_categories'
      });
      throw new APIError("Veritabanı hatası", 500, "DATABASE_ERROR");
    });

    // Soru sayısı 0 olan kategorileri filtrele
    const availableCategories = categories.filter(cat => cat._count.questions > 0);

    // Response formatını düzenle
    const formattedCategories = availableCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      questionCount: cat._count.questions
    }));

    return apiResponse.success({
      data: formattedCategories
    });

  } catch (error) {
    logger.error('category', error as Error, {
      action: 'list',
      path: request.url
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Kategoriler getirilirken bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}