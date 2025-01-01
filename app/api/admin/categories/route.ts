import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError } from "@/lib/errors";
import { checkAdminRole } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Kategori şeması
const categorySchema = z.object({
  name: z.string().min(1, "Kategori adı gereklidir").max(100, "Kategori adı çok uzun")
});

// Kategorileri listeleme (GET)
export async function GET(request: NextRequest) {
  try {
    await checkAdminRole(request);

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
    });

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      questionCount: category._count.questions
    }));

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

// POST - Kategori ekleme
export async function POST(request: NextRequest) {
  try {
    await checkAdminRole(request);

    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
      }
    });

    // Kategori oluşturma logu
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