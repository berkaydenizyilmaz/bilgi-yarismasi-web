import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { APIError, ValidationError } from '@/lib/errors';
import { z } from 'zod';

// Log verisi için Zod şeması
const logSchema = z.object({
  level: z.enum(['info', 'warn', 'error']),
  message: z.string(),
  timestamp: z.string().datetime(),
  path: z.string().optional(),
  userId: z.number().optional(),
  error: z.any().optional(),
  metadata: z.record(z.any()).optional()
});

export async function POST(request: NextRequest) {
  let body: z.infer<typeof logSchema> | undefined;
  let validatedBody: z.infer<typeof logSchema>;

  try {
    // Request body'yi parse et
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError("Geçersiz istek formatı");
    }

    // Zod validasyonu
    try {
      logSchema.parse(body);
      validatedBody = body as z.infer<typeof logSchema>;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.warn('Log validasyon hatası:', {
          errors: error.errors
        });
        throw new ValidationError(error.errors[0].message);
      }
      throw error;
    }

    // Log'u kaydet
    const log = await prisma.log.create({
      data: {
        level: validatedBody.level,
        message: validatedBody.message,
        timestamp: new Date(validatedBody.timestamp),
        path: validatedBody.path,
        user_id: validatedBody.userId,
        error: validatedBody.error,
        metadata: validatedBody.metadata,
      },
    }).catch((error) => {
      console.error('Veritabanı hatası:', error);
      throw new APIError("Log kaydedilemedi", 500, "DATABASE_ERROR");
    });

    console.info('Log başarıyla kaydedildi:', {
      id: log.id,
      level: log.level,
      message: log.message
    });

    return apiResponse.success({ 
      message: 'Log kaydedildi',
      logId: log.id 
    });
    
  } catch (error) {
    console.error('Log kaydetme hatası:', error);

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Log kaydedilirken beklenmeyen bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}