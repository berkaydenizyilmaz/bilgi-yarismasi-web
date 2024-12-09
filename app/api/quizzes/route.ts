import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, categoryId, totalQuestions, correctAnswers, incorrectAnswers, score } = body;

        // Gelen verileri doğrula
        if (!userId || !categoryId || totalQuestions === undefined) {
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
            },
        });

        console.log("Quiz kaydedildi:", quiz);

        return NextResponse.json(quiz, { status: 201 });
    } catch (error) {
        console.error("Quiz kaydetme hatası:", error);
        return NextResponse.json(
            { error: "Quiz kaydedilemedi." }, 
            { status: 500 }
        );
    }
}