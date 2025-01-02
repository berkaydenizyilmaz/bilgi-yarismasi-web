import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    
    if (isNaN(id)) {
      throw new APIError("Geçersiz kategori ID", 400);
    }

    const category = await prisma.category.findUnique({
      where: { id },
      select: { name: true }
    });

    if (!category) {
      throw new APIError("Kategori bulunamadı", 404);
    }

    return apiResponse.success(category);
  } catch (error) {
    return apiResponse.error(
      error instanceof APIError ? error : new APIError("Beklenmeyen bir hata oluştu", 500)
    );
  }
}