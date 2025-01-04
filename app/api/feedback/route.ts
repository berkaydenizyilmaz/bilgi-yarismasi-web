import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import { APIError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Geri bildirim validasyon şeması
 */
const feedbackSchema = z.object({
  name: z.string().min(1, "İsim gereklidir."),
  email: z.string().email("Geçerli bir email adresi giriniz."),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır."),
});

/**
 * POST /api/feedback
 * Yeni geri bildirim kaydı oluşturur
 * 
 * Veritabanı İşlemleri:
 * - Feedback tablosuna yeni kayıt ekler
 * - Oluşturulma tarihi otomatik eklenir
 * 
 * Request Body:
 * - name: Gönderen adı
 * - email: Gönderen email
 * - message: Geri bildirim mesajı
 */
export async function POST(request: NextRequest) {
  let body: z.infer<typeof feedbackSchema> | undefined;

  try {
    // Request body'yi parse et ve doğrula
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError("Geçersiz istek formatı");
    }

    // Zod validasyonu
    feedbackSchema.parse(body);
    const validatedBody = body as z.infer<typeof feedbackSchema>;

    // Geri bildirimi kaydet
    const feedback = await prisma.feedback.create({
      data: {
        name: validatedBody.name,
        email: validatedBody.email,
        message: validatedBody.message,
      },
    });

    // Başarılı kayıt logu
    logger.info('feedback', 'create', 'Yeni geri bildirim kaydedildi', {
      feedbackId: feedback.id,
      name: feedback.name,
      email: feedback.email
    });

    return apiResponse.success({
      message: "Feedback başarıyla kaydedildi",
      feedbackId: feedback.id,
    });

  } catch (error) {
    // Hata logu
    logger.error('feedback', error as Error, {
      action: 'create',
      name: body?.name,
      email: body?.email,
      errorType: error instanceof z.ZodError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR'
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    if (error instanceof z.ZodError) {
      return apiResponse.error(new ValidationError(error.errors[0].message));
    }

    return apiResponse.error(
      new APIError("Feedback kaydedilirken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR")
    );
  }
}