import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");
        const userId = searchParams.get("userId");

        if (!categoryId || !userId) {
            return apiResponse.error("Kategori ID'si veya Kullanıcı ID'si belirtilmedi.");
        }

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
            return apiResponse.error(
                `Bu kategoride sadece ${totalUnansweredQuestions} adet cevaplanmamış soru kaldı.`,
                404
            );
        }

        const questions = await prisma.question.findMany({
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
            },
            take: 10,
            orderBy: {
                id: 'asc'
            }
        });

        const shuffledQuestions = questions
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);

        return apiResponse.success(shuffledQuestions);
    } catch (error) {
        console.error("Soruları alma hatası:", error);
        return apiResponse.error("Beklenmeyen bir hata oluştu.");
    }
}