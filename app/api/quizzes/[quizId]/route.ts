import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError, AuthenticationError } from "@/lib/errors";
import jwt from 'jsonwebtoken';
import { logger } from "@/lib/logger";

interface JWTPayload {
 id: number;
}

export async function GET(req: NextRequest, { params }: { params: { quizId: string } }) {
   try {
       logger.request(req);

       // Token kontrolü
       const token = req.cookies.get("token")?.value;
       if (!token) {
           logger.warn('Quiz detayı görüntüleme başarısız: Token bulunamadı');
           throw new AuthenticationError();
       }

       // Token'dan kullanıcı bilgisini al
       let decoded: JWTPayload;
       try {
           decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
       } catch (error) {
           logger.warn('Quiz detayı görüntüleme başarısız: Geçersiz token', { token });
           throw new AuthenticationError("Geçersiz veya süresi dolmuş oturum");
       }

       // Quiz ID validasyonu
       const quizId = parseInt(params.quizId);
       if (isNaN(quizId)) {
           logger.warn('Quiz detayı görüntüleme başarısız: Geçersiz Quiz ID', { 
               quizId: params.quizId,
               userId: decoded.id 
           });
           throw new ValidationError("Geçersiz Quiz ID");
       }

       // Quiz'i getir
       const quiz = await prisma.quiz.findUnique({
           where: { 
               id: quizId,
               user_id: decoded.id
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
           logger.error(error as Error, {
               quizId,
               userId: decoded.id,
               message: 'Quiz bilgileri alınamadı'
           });
           throw new APIError("Quiz bilgileri alınamadı", 500, "DATABASE_ERROR");
       });

       if (!quiz) {
           logger.warn('Quiz bulunamadı', {
               quizId,
               userId: decoded.id
           });
           return NextResponse.json(apiResponse.error(new APIError("Quiz bulunamadı", 404, "NOT_FOUND")));
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

       logger.info('Quiz detayları başarıyla getirildi', {
           quizId,
           userId: decoded.id,
           categoryName: quiz.category.name,
           score: quiz.score,
           totalQuestions: quiz.total_questions
       });

       return NextResponse.json(apiResponse.success({
           data: formattedQuiz
       }));

   } catch (error) {
       logger.error(error as Error, {
           path: req.url,
           quizId: params.quizId
       });

       return NextResponse.json(apiResponse.error(error instanceof APIError ? error : new APIError("Beklenmedik bir hata oluştu", 500, "INTERNAL_SERVER_ERROR")));
   }
}