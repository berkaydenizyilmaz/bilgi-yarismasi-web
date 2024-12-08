import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
        return NextResponse.json({ error: "Kategori ID'si belirtilmedi." }, { status: 400 });
    }

    try {
        const questions = await prisma.question.findMany({
            where: { category_id: Number(categoryId) },
            select: {
                id: true,
                question_text: true,
                option_a: true,
                option_b: true,
                option_c: true,
                option_d: true,
                correct_option: true,
            },
        });

        return NextResponse.json(questions);
    } catch (error) {
        console.error("Soruları alma hatası:", error);
        return NextResponse.json({ error: "Sorular alınamadı." }, { status: 500 });
    }
}