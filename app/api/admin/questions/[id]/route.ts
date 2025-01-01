import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError } from "@/lib/errors";
import { checkAdminRole } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

const questionSchema = z.object({
  questionText: z.string().min(1, "Soru metni gereklidir"),
  optionA: z.string().min(1, "A şıkkı gereklidir"),
  optionB: z.string().min(1, "B şıkkı gereklidir"),
  optionC: z.string().min(1, "C şıkkı gereklidir"),
  optionD: z.string().min(1, "D şıkkı gereklidir"),
  correctOption: z.enum(["A", "B", "C", "D"]),
  categoryId: z.number().positive()
});

// Soru güncelleme (PUT)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdminRole(request);

    const id = parseInt(params.id);
    if (isNaN(id)) {
      throw new ValidationError("Geçersiz soru ID'si");
    }

    const body = await request.json();
    const validatedData = questionSchema.parse(body);

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
        category: {
          select: {
            name: true
          }
        }
      }
    });

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
      new APIError("Soru güncellenirken bir hata oluştu", 500)
    );
  }
}

// Soru silme (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdminRole(request);

    const id = parseInt(params.id);
    if (isNaN(id)) {
      throw new ValidationError("Geçersiz soru ID'si");
    }

    await prisma.question.delete({
      where: { id }
    });

    return apiResponse.success({
      message: "Soru başarıyla silindi"
    });

  } catch (error) {
    logger.error(error as Error);
    if (error instanceof APIError) {
      return apiResponse.error(error);
    }
    return apiResponse.error(
      new APIError("Soru silinirken bir hata oluştu", 500)
    );
  }
}