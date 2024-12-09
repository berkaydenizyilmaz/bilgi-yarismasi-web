import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, categoryId, totalQuestions, correctAnswers, incorrectAnswers, score, questions } = body;

        // Quiz kaydını oluştur
        const quiz = await prisma.quiz.create({
            data: {
                user_id: userId,
                category_id: categoryId,
                total_questions: totalQuestions,
                correct_answers: correctAnswers,
                incorrect_answers: incorrectAnswers,
                score: score,
                user_interactions: {
                    create: questions.map((question: any) => ({
                        user_id: userId,
                        question_id: question.id,
                        seen_at: new Date(),
                        answered_at: new Date(),
                        is_correct: question.isCorrect,
                        user_answer: question.userAnswer
                    }))
                }
            },
            include: {
                user_interactions: {
                    include: {
                        question: true
                    }
                },
                category: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return NextResponse.json(quiz, { status: 201 });
    } catch (error) {
        console.error("Quiz kaydetme hatası:", error);
        return NextResponse.json(
            { error: "Quiz kaydedilemedi." }, 
            { status: 500 }
        );
    }
}