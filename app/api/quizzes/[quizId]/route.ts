import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { quizId: string } }
) {
    try {
        const quizId = parseInt(params.quizId);

        if (isNaN(quizId)) {
            return NextResponse.json(
                { error: "Geçersiz Quiz ID" },
                { status: 400 }
            );
        }

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                category: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!quiz) {
            return NextResponse.json(
                { error: "Quiz bulunamadı" },
                { status: 404 }
            );
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error("Quiz getirme hatası:", error);
        return NextResponse.json(
            { error: "Quiz sonuçları alınamadı" },
            { status: 500 }
        );
    }
}