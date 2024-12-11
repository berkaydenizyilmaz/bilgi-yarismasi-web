import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";

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
      console.error("Categories fetch error:", error);
      throw new APIError("Kategoriler alınamadı", 500, "DATABASE_ERROR");
    });

    if (!categories?.length) {
      throw new APIError("Henüz kategori bulunmuyor", 404, "NOT_FOUND");
    }

    // Kategori ve soru sayılarını formatla
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      questionCount: category._count.questions
    }));

    return apiResponse.success(formattedCategories);

  } catch (error) {
    console.error("Categories error:", error);

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Kategoriler alınırken beklenmeyen bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}