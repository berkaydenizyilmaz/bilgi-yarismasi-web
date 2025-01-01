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
  context: { params: { id: string }}
) {
  try {
    await checkAdminRole(request);
    const id = parseInt(context.params.id); // context.params.id olarak düzeltildi
    if (isNaN(id)) {
      throw new ValidationError("Geçersiz kategori ID'si");
    }

    const body = await request.json();
    const validatedData = categorySchema.parse(body);

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

    return apiResponse.success({
      id: category.id,
      name: category.name,
      questionCount: category._count.questions
    });
  } catch (error) {
    logger.error('category', error as Error, {
      action: 'update_attempt',
      categoryId: context.params.id // context.params.id olarak düzeltildi
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
  context: { params: { id: string }}
) {
  try {
    await checkAdminRole(request);
    const id = parseInt(context.params.id); // context.params.id olarak düzeltildi
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

    if (category._count.questions > 0) {
      throw new ValidationError("Bu kategoride sorular bulunduğu için silinemez");
    }

    await prisma.category.delete({
      where: { id }
    });

    return apiResponse.success({
      message: "Kategori başarıyla silindi"
    });
  } catch (error) {
    logger.error('category', error as Error, {
      action: 'delete_attempt',
      categoryId: context.params.id // context.params.id olarak düzeltildi
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError("Kategori silinirken bir hata oluştu", 500)
    );
  }
}
