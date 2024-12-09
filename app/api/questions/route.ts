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
        // Önce kategorideki toplam çözülmemiş soru sayısını kontrol et
        const totalUnansweredQuestions = await prisma.question.count({
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
            }
        });

        // Eğer yeterli soru yoksa hata döndür
        if (totalUnansweredQuestions < 10) {
            return NextResponse.json({ 
                error: "Bu kategoride yeterli sayıda cevaplanmamış soru bulunmamaktadır.",
                remainingQuestions: totalUnansweredQuestions 
            }, { status: 404 });
        }

        // Kullanıcının görmediği soruları rastgele seç
        const questions = await prisma.$queryRaw`
            SELECT 
                q.id,
                q.question_text,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_option
            FROM "Question" q
            WHERE q.category_id = ${Number(categoryId)}
            AND NOT EXISTS (
                SELECT 1 
                FROM "UserSeenQuestion" usq 
                WHERE usq.question_id = q.id 
                AND usq.user_id = ${Number(userId)}
            )
            ORDER BY RANDOM()
            LIMIT 10
        `;

        return NextResponse.json(questions);
    } catch (error) {
        console.error("Soruları alma hatası:", error);
        return NextResponse.json({ error: "Sorular alınamadı." }, { status: 500 });
    }
}