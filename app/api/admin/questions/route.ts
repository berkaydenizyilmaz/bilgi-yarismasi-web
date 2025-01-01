import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError } from "@/lib/errors";
import { checkAdminRole } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Validasyon şeması
const questionSchema = z.object({
  questionText: z.string().min(1, "Soru metni gereklidir"),
  optionA: z.string().min(1, "A şıkkı gereklidir"),
  optionB: z.string().min(1, "B şıkkı gereklidir"),
  optionC: z.string().min(1, "C şıkkı gereklidir"),
  optionD: z.string().min(1, "D şıkkı gereklidir"),
  correctOption: z.enum(["A", "B", "C", "D"]),
  categoryId: z.number().positive()
});

// Soruları listeleme (GET)
export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");

    // Filtreleme koşulları
    const where = {
      ...(search && {
        question_text: {
          contains: search,
          mode: 'insensitive' as const
        }
      }),
      ...(category && category !== "all" && {
        category_id: parseInt(category)
      })
    };

    // Toplam soru sayısı
    const total = await prisma.question.count({ where });

    // Soruları getir
    const questions = await prisma.question.findMany({
      where,
      take: limit,
      skip: offset,
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    // Yanıt formatını düzenle
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      questionText: q.question_text,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      correctOption: q.correct_option,
      categoryId: q.category_id,
      categoryName: q.category.name
    }));

    return apiResponse.success({
      questions: formattedQuestions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    logger.error(error as Error);
    if (error instanceof APIError) {
      return apiResponse.error(error);
    }
    return apiResponse.error(
      new APIError("Sorular alınırken bir hata oluştu", 500)
    );
  }
}

// Soru ekleme (POST)
export async function POST(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

    // Request body'yi al ve validate et
    const body = await request.json();
    const validatedData = questionSchema.parse(body);

    // Soruyu veritabanına ekle
    const question = await prisma.question.create({
      data: {
        question_text: validatedData.questionText,
        option_a: validatedData.optionA,
        option_b: validatedData.optionB,
        option_c: validatedData.optionC,
        option_d: validatedData.optionD,
        correct_option: validatedData.correctOption,
        category_id: validatedData.categoryId
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

    // Yanıt formatını düzenle
    const formattedQuestion = {
      id: question.id,
      questionText: question.question_text,
      optionA: question.option_a,
      optionB: question.option_b,
      optionC: question.option_c,
      optionD: question.option_d,
      correctOption: question.correct_option,
      categoryId: question.category_id,
      categoryName: question.category.name
    };

    return apiResponse.success(formattedQuestion);

  } catch (error) {
    logger.error(error as Error);
    if (error instanceof z.ZodError) {
      return apiResponse.error(
        new ValidationError(error.errors[0].message)
      );
    }
    if (error instanceof APIError) {
      return apiResponse.error(error);
    }
    return apiResponse.error(
      new APIError("Soru eklenirken bir hata oluştu", 500)
    );
  }
}