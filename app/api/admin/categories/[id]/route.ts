import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError } from "@/lib/errors";
import { checkAdminRole } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

const categorySchema = z.object({
  name: z.string().min(1, "Kategori adı gereklidir").max(100, "Kategori adı çok uzun")
});

// Kategori güncelleme (PUT)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  let oldCategoryName = '';
  let newCategoryName = '';

  try {
    await checkAdminRole(request);
    
    // params'ı await edelim
    const parameters = await params;
    const id = parseInt(parameters.id);

    if (isNaN(id)) {
      throw new ValidationError("Geçersiz kategori ID'si");
    }

    // Mevcut kategori bilgisini al
    const currentCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!currentCategory) {
      throw new ValidationError("Kategori bulunamadı");
    }

    oldCategoryName = currentCategory.name;

    const body = await request.json();
    const validatedData = categorySchema.parse(body);
    newCategoryName = validatedData.name;

    // Aynı isimde başka kategori var mı kontrol et
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: 'insensitive'
        },
        NOT: {
          id: id
        }
      }
    });

    if (existingCategory) {
      throw new ValidationError("Bu isimde bir kategori zaten mevcut");
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: validatedData.name
      },
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      }
    });

    // Kategori güncelleme logu
    logger.categoryUpdated(category.name, category.id);

    return apiResponse.success({
      id: category.id,
      name: category.name,
      questionCount: category._count.questions
    });

  } catch (error) {
    logger.error('category', error as Error, {
      action: 'update',
      categoryId: params.id,
      oldName: oldCategoryName,
      newName: newCategoryName,
      errorType: error instanceof z.ZodError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR'
    });

    if (error instanceof z.ZodError) {
      return apiResponse.error(
        new ValidationError(error.errors[0].message)
      );
    }
    if (error instanceof APIError) {
      return apiResponse.error(error);
    }
    return apiResponse.error(
      new APIError("Kategori güncellenirken bir hata oluştu", 500)
    );
  }
}

// Kategori silme (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  let categoryName = '';

  try {
    await checkAdminRole(request);

    // params'ı await edelim
    const parameters = await params;
    const id = parseInt(parameters.id);
    
    if (isNaN(id)) {
      throw new ValidationError("Geçersiz kategori ID'si");
    }

    // Kategoride soru var mı kontrol et
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      }
    });

    if (!category) {
      throw new ValidationError("Kategori bulunamadı");
    }

    categoryName = category.name;

    if (category._count.questions > 0) {
      throw new ValidationError("Bu kategoride sorular bulunduğu için silinemez");
    }

    await prisma.category.delete({
      where: { id }
    });

    // Kategori silme logu
    logger.categoryDeleted(categoryName, id);

    return apiResponse.success({
      message: "Kategori başarıyla silindi"
    });

  } catch (error) {
    logger.error('category', error as Error, {
      action: 'delete',
      categoryId: params.id,
      categoryName,
      errorType: error instanceof ValidationError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR'
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }
    return apiResponse.error(
      new APIError("Kategori silinirken bir hata oluştu", 500)
    );
  }
} 