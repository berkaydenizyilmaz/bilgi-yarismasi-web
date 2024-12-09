import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const userId = searchParams.get("userId");

    if (!categoryId || !userId) {
        return NextResponse.json({ error: "Kategori ID'si veya Kullanıcı ID'si belirtilmedi." }, { status: 400 });
    }

    try {
        // Kullanıcının görmediği soruları getir
        const questions = await prisma.question.findMany({
            where: {
                category_id: Number(categoryId),
                AND: {
                    NOT: {
                        seen_by_users: {
                            some: {
                                user_id: Number(userId)
                            }
                        }
                    }
                }
            },
            select: {
                id: true,
                question_text: true,
                option_a: true,
                option_b: true,
                option_c: true,
                option_d: true,
                correct_option: true,
            },
            take: 10, // Her seferinde 10 soru getir
        });

        if (questions.length === 0) {
            return NextResponse.json({ error: "Bu kategoride cevaplanmamış soru kalmadı." }, { status: 404 });
        }

        return NextResponse.json(questions);
    } catch (error) {
        console.error("Soruları alma hatası:", error);
        return NextResponse.json({ error: "Sorular alınamadı." }, { status: 500 });
    }
}