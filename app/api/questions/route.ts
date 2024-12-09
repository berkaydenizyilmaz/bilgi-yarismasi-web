import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");
        const userId = searchParams.get("userId");

        if (!categoryId || !userId) {
            return NextResponse.json({ 
                error: "Kategori ID'si veya Kullanıcı ID'si belirtilmedi." 
            }, { status: 400 });
        }

        // Cevaplanmamış soruları kontrol et
        const totalUnansweredQuestions = await prisma.question.count({
            where: {
                category_id: Number(categoryId),
                NOT: {
                    user_interactions: {
                        some: {
                            user_id: Number(userId)
                        }
                    }
                }
            }
        });

        if (totalUnansweredQuestions < 10) {
            return NextResponse.json({ 
                error: "Bu kategoride yeterli sayıda cevaplanmamış soru bulunmamaktadır.",
                remainingQuestions: totalUnansweredQuestions 
            }, { status: 404 });
        }

        // Tüm cevaplanmamış soruları getir
        const allQuestions = await prisma.question.findMany({
            where: {
                category_id: Number(categoryId),
                NOT: {
                    user_interactions: {
                        some: {
                            user_id: Number(userId)
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
            }
        });

        // Soruları karıştır ve ilk 3'ünü al
        const shuffledQuestions = allQuestions
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        return NextResponse.json(shuffledQuestions);

    } catch (error) {
        console.error("Soruları alma hatası:", error);
        return NextResponse.json({ 
            error: "Beklenmeyen bir hata oluştu." 
        }, { status: 500 });
    }
}