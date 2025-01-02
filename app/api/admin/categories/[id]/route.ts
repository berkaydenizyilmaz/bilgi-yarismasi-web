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
  { params }: { params: { id: string } } & { searchParams: { [key: string]: string | string[] | undefined } }
) {
  try {
    await checkAdminRole(request);
    const id = parseInt(params.id); 
    if (isNaN(id)) {
      throw new ValidationError("Geçersiz kategori ID'si");
    }

    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    // Kategoriyi güncelle
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

// Kategori silme (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } & { searchParams: { [key: string]: string | string[] | undefined } }
) {
  try {
    await checkAdminRole(request);
    const id = parseInt(params.id); 
    if (isNaN(id)) {
      throw new ValidationError("Geçersiz kategori ID'si");
    }

    // Kategoriyi sil
    await prisma.category.delete({
      where: { id }
    });

    return apiResponse.success({
      message: "Kategori başarıyla silindi"
    });
  } catch (error) {
    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError("Kategori silinirken bir hata oluştu", 500)
    );
  }
}
