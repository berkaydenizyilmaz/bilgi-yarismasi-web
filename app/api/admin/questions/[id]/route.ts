import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError } from "@/lib/errors";
import { checkAdminRole } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Soru güncelleme validasyon şeması
 */
const questionSchema = z.object({
  questionText: z.string().min(1, "Soru metni gereklidir"),
  optionA: z.string().min(1, "A şıkkı gereklidir"),
  optionB: z.string().min(1, "B şıkkı gereklidir"),
  optionC: z.string().min(1, "C şıkkı gereklidir"),
  optionD: z.string().min(1, "D şıkkı gereklidir"),
  correctOption: z.enum(["A", "B", "C", "D"]),
  categoryId: z.number().positive()
});

/**
 * PUT /api/admin/questions/[id]
 * Soru bilgilerini günceller
 * 
 * Veritabanı İşlemleri:
 * - Önce sorunun varlığını kontrol eder
 * - Question tablosunda güncelleme yapar
 * - Kategori değişikliğini takip eder
 */

// @ts-ignore
export async function PUT(
  request: NextRequest,
  context: any
) {
  let categoryName = '';
  let oldCategoryName = '';
  
  try {
    await checkAdminRole(request);

    // ID ve body validasyonu
    const id = parseInt(context.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Geçersiz soru ID'si");
    }

    const body = await request.json();
    const validatedData = questionSchema.parse(body);

    // Mevcut soru kontrolü
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    if (!existingQuestion) {
      throw new APIError("Soru bulunamadı", 404);
    }

    oldCategoryName = existingQuestion.category.name;

    // Soruyu güncelle
    const question = await prisma.question.update({
      where: { id },
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
        category: true
      }
    });

    categoryName = question.category.name;

    // Başarılı güncelleme logu
    logger.questionUpdated(question.id, categoryName);

    return apiResponse.success({
      id: question.id,
      questionText: question.question_text,
      optionA: question.option_a,
      optionB: question.option_b,
      optionC: question.option_c,
      optionD: question.option_d,
      correctOption: question.correct_option.toLowerCase(),
      categoryId: question.category_id,
      categoryName: question.category.name
    });

  } catch (error) {
    logger.error('question', error as Error, {
      action: 'update',
      questionId: context.params.id,
      oldCategoryName,
      newCategoryName: categoryName,
      errorType: error instanceof z.ZodError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR'
    });

    if (error instanceof z.ZodError) {
      return apiResponse.error(new ValidationError(error.errors[0].message));
    }
    if (error instanceof APIError) {
      return apiResponse.error(error);
    }
    return apiResponse.error(
      new APIError("Soru güncellenirken bir hata oluştu", 500)
    );
  }
}

/**
 * DELETE /api/admin/questions/[id]
 * Soruyu siler
 * 
 * Veritabanı İşlemleri:
 * - Önce sorunun varlığını kontrol eder
 * - Question tablosundan kaydı siler
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  let categoryName = '';
  
  try {
    await checkAdminRole(request);

    const id = parseInt(context.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Geçersiz soru ID'si");
    }

    // Silinecek soruyu bul
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    if (!question) {
      throw new APIError("Soru bulunamadı", 404);
    }

    categoryName = question.category.name;

    // Soruyu sil
    await prisma.question.delete({
      where: { id }
    });

    // Başarılı silme logu
    logger.questionDeleted(id, categoryName);

    return apiResponse.success({
      message: "Soru başarıyla silindi"
    });

  } catch (error) {
    logger.error('question', error as Error, {
      action: 'delete',
      questionId: context.params.id,
      categoryName,
      errorType: error instanceof ValidationError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR'
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }
    return apiResponse.error(
      new APIError("Soru silinirken bir hata oluştu", 500)
    );
  }
}