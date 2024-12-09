import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";

export async function GET(
    request: NextRequest,
    { params }: { params: { quizId: string } }
) {
    try {
        const quizId = parseInt(params.quizId);

        if (isNaN(quizId)) {
            return apiResponse.error("Geçersiz Quiz ID");
        }

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                category: {
                    select: {
                        name: true,
                    },
                },
                user_interactions: {
                    include: {
                        question: {
                            select: {
                                question_text: true,
                                correct_option: true,
                                option_a: true,
                                option_b: true,
                                option_c: true,
                                option_d: true,
                            }
                        }
                    }
                }
            },
        });

        if (!quiz) {
            return apiResponse.error("Quiz bulunamadı", 404);
        }

        const formattedQuiz = {
            ...quiz,
            questions: quiz.user_interactions.map(interaction => ({
                question: interaction.question.question_text,
                userAnswer: interaction.user_answer,
                correctAnswer: interaction.question.correct_option,
                isCorrect: interaction.is_correct,
                options: {
                    A: interaction.question.option_a,
                    B: interaction.question.option_b,
                    C: interaction.question.option_c,
                    D: interaction.question.option_d,
                }
            }))
        };

        return apiResponse.success(formattedQuiz);
    } catch (error) {
        console.error("Quiz getirme hatası:", error);
        return apiResponse.error("Quiz sonuçları alınamadı");
    }
}