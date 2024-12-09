import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    if (!categories?.length) {
      return apiResponse.error("Kategoriler bulunamadı.", 404);
    }

    return apiResponse.success(categories);
  } catch (error) {
    console.error("Kategorileri alma hatası:", error);
    return apiResponse.error("Kategoriler alınamadı.");
  }
}