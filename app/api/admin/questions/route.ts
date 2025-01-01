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
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

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
    logger.error('question', error as Error, {
      action: 'list_attempt',
      search: searchParams.get("search"),
      category: searchParams.get("category"),
      page: page
    });

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
  let body;
  try {
    await checkAdminRole(request);

    body = await request.json();
    const validatedData = questionSchema.parse(body);

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
          select: { name: true }
        }
      }
    });

    logger.info('question', 'create', `Yeni soru eklendi`, {
      questionId: question.id,
      categoryId: question.category_id,
      categoryName: question.category.name,
      questionPreview: question.question_text.substring(0, 50) + '...'
    });

    return apiResponse.success(question);

  } catch (error) {
    logger.error('question', error as Error, {
      action: 'create',
      categoryId: body?.categoryId,
      errorType: error instanceof z.ZodError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR',
      errorContext: 'create_question'
    });

    if (error instanceof z.ZodError) {
      return apiResponse.error(new ValidationError(error.errors[0].message));
    }
    return apiResponse.error(
      new APIError("Soru eklenirken bir hata oluştu", 500)
    );
  }
}

// DELETE - Soru silme
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    await checkAdminRole(request);
    
    const id = parseInt(searchParams.get("id") || "");

    const question = await prisma.question.delete({
      where: { id },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    logger.info('question', 'delete', `Soru silindi`, {
      questionId: question.id,
      categoryId: question.category_id,
      categoryName: question.category.name,
      questionPreview: question.question_text.substring(0, 50) + '...'
    });

    return apiResponse.success({ message: "Soru başarıyla silindi" });

  } catch (error) {
    logger.error('question', error as Error, {
      action: 'delete_attempt',
      questionId: searchParams.get("id")
    });

    return apiResponse.error(
      new APIError("Soru silinirken bir hata oluştu", 500)
    );
  }
}