import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import { APIError, ValidationError } from "@/lib/errors";

const feedbackSchema = z.object({
  name: z.string().min(1, "İsim gereklidir."),
  email: z.string().email("Geçerli bir email adresi giriniz."),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır."),
});

export async function POST(request: NextRequest) {
  let body: z.infer<typeof feedbackSchema> | undefined;

  try {
    // Request body'yi parse et
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError("Geçersiz istek formatı");
    }

    // Zod validasyonu
    feedbackSchema.parse(body);
    const validatedBody = body as z.infer<typeof feedbackSchema>;

    // Feedback'i kaydet
    const feedback = await prisma.feedback.create({
      data: {
        name: validatedBody.name,
        email: validatedBody.email,
        message: validatedBody.message,
      },
    });

    return apiResponse.success({
      message: "Feedback başarıyla kaydedildi",
      feedbackId: feedback.id,
    });
  } catch (error) {
    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError("Feedback kaydedilirken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR")
    );
  }
}