import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Kategorileri veritabanından al
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Kategorileri alma hatası:", error);
    return NextResponse.json(
      { error: "Kategoriler alınamadı." },
      { status: 500 }
    );
  }
}