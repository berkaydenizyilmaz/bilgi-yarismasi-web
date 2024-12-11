import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError, AuthenticationError } from "@/lib/errors";
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: number;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { quizId: string } }
) {
    try {
        // Token kontrolü
        const token = request.cookies.get("token")?.value;
        if (!token) {
            throw new AuthenticationError();
        }

        // Token'dan kullanıcı bilgisini al
        let decoded: JWTPayload;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        } catch (error) {
            throw new AuthenticationError("Geçersiz veya süresi dolmuş oturum");
        }

        // Quiz ID validasyonu
        const quizId = parseInt(params.quizId);
        if (isNaN(quizId)) {
            throw new ValidationError("Geçersiz Quiz ID");
        }

        // Quiz'i getir
        const quiz = await prisma.quiz.findUnique({
            where: { 
                id: quizId,
                user_id: decoded.id // Sadece kendi quizlerini görebilir
            },
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
        }).catch((error) => {
            console.error("Quiz fetch error:", error);
            throw new APIError("Quiz bilgileri alınamadı", 500, "DATABASE_ERROR");
        });

        if (!quiz) {
            throw new APIError("Quiz bulunamadı", 404, "NOT_FOUND");
        }

        // Quiz verilerini formatla
        const formattedQuiz = {
            id: quiz.id,
            category: quiz.category.name,
            total_questions: quiz.total_questions,
            correct_answers: quiz.correct_answers,
            incorrect_answers: quiz.incorrect_answers,
            score: quiz.score,
            played_at: quiz.played_at,
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
        console.error("Quiz detail error:", error);

        if (error instanceof APIError) {
            return apiResponse.error(error);
        }

        return apiResponse.error(
            new APIError(
                "Quiz detayları alınırken beklenmeyen bir hata oluştu",
                500,
                "INTERNAL_SERVER_ERROR"
            )
        );
    }
}