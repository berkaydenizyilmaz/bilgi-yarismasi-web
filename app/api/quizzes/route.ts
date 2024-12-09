import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, categoryId, totalQuestions, correctAnswers, incorrectAnswers, score, questions } = body;

        // Gelen verileri doğrula
        if (!userId || !categoryId || totalQuestions === undefined || !questions) {
            return NextResponse.json(
                { error: "Gerekli alanlar eksik." }, 
                { status: 400 }
            );
        }

        // Quiz kaydını oluştur
        const quiz = await prisma.quiz.create({
            data: {
                user_id: userId,
                category_id: categoryId,
                total_questions: totalQuestions,
                correct_answers: correctAnswers,
                incorrect_answers: incorrectAnswers,
                score: score,
                quiz_questions: {
                    create: questions.map((questionId: number) => ({
                        question_id: questionId
                    }))
                }
            },
        });

        // Soruları görülmüş olarak işaretle
        await prisma.userSeenQuestion.createMany({
            data: questions.map((questionId: number) => ({
                user_id: userId,
                question_id: questionId,
            })),
            skipDuplicates: true, // Eğer daha önce kaydedilmişse atla
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