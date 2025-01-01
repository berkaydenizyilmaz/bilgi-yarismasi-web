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
  let body;
  try {
    await checkAdminRole(request);
    
    body = await request.json();
    const validatedData = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: { name: validatedData.name }
    });

    logger.info('category', 'create', `Yeni kategori oluşturuldu: ${category.name}`, {
      categoryId: category.id,
      name: category.name
    });

    return apiResponse.success(category);

  } catch (error) {
    logger.error('category', error as Error, {
      action: 'create',
      categoryName: body?.name,
      errorType: error instanceof z.ZodError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR',
      errorContext: 'create_category'
    });

    if (error instanceof z.ZodError) {
      return apiResponse.error(new ValidationError(error.errors[0].message));
    }
    return apiResponse.error(
      new APIError("Kategori eklenirken bir hata oluştu", 500)
    );
  }
}

// DELETE - Kategori silme
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    await checkAdminRole(request);
    
    const id = parseInt(searchParams.get("id") || "");

    const category = await prisma.category.delete({
      where: { id }
    });

    logger.info('category', 'delete', `Kategori silindi: ${category.name}`, {
      categoryId: category.id,
      name: category.name
    });

    return apiResponse.success({ message: "Kategori başarıyla silindi" });

  } catch (error) {
    logger.error('category', error as Error, {
      categoryId: searchParams.get("id"),
      errorType: 'DATABASE_ERROR',
      errorContext: 'delete_category',
      action: 'delete'
    });
    
    return apiResponse.error(
      new APIError("Kategori silinirken bir hata oluştu", 500)
    );
  }
} 