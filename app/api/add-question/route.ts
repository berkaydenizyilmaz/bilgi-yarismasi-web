import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import { APIError, ValidationError } from "@/lib/errors";

const questionSchema = z.object({
  questionText: z.string().min(1, "Soru metni boş olamaz."),
  optionA: z.string().min(1, "Seçenek A boş olamaz."),
  optionB: z.string().min(1, "Seçenek B boş olamaz."),
  optionC: z.string().min(1, "Seçenek C boş olamaz."),
  optionD: z.string().min(1, "Seçenek D boş olamaz."),
  correctOption: z.enum(["A", "B", "C", "D"], {
    errorMap: () => ({ message: "Doğru seçenek seçilmelidir." }),
  }),
  categoryId: z.number().int().positive("Geçerli bir kategori ID'si girin."), // Kategori ID'si için doğrulama
});

export async function POST(request: NextRequest) {
  let body: z.infer<typeof questionSchema> | undefined;

  try {
    // Request body'yi parse et
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError("Geçersiz istek formatı");
    }

    // Zod validasyonu
    questionSchema.parse(body);
    const validatedBody = body as z.infer<typeof questionSchema>;

    // Soruyu veritabanına ekle
    const question = await prisma.question.create({
      data: {
        question_text: validatedBody.questionText,
        option_a: validatedBody.optionA,
        option_b: validatedBody.optionB,
        option_c: validatedBody.optionC,
        option_d: validatedBody.optionD,
        correct_option: validatedBody.correctOption,
        category: {
          connect: { id: validatedBody.categoryId }, // Kategori ile bağlantı kur
        },
      },
    });

    return apiResponse.success({
      message: "Soru başarıyla eklendi",
      questionId: question.id,
    });
  } catch (error) {
    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError("Soru eklenirken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR")
    );
  }
}