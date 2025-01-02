import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { z } from 'zod';
import { APIError } from '@/lib/errors';

// Log verisi için Zod şeması
const logSchema = z.object({
  level: z.enum(['info', 'warn', 'error']),
  module: z.enum([
    'user',
    'question',
    'category',
    'quiz',
    'auth',
    'system',
    'feedback',
    'ai'
  ]),
  action: z.enum([
    'create',
    'update',
    'delete',
    'auth',
    'error',
    'access',
    'list',
    'read',
    'generate'
  ]),
  message: z.string(),
  timestamp: z.string().datetime(),
  path: z.string().optional(),
  userId: z.number().optional(),
  error: z.any().optional(),
  metadata: z.record(z.any()).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Request body'yi parse et
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('JSON parse hatası:', e);
      return apiResponse.error(
        new APIError("Geçersiz JSON formatı", 400, "INVALID_REQUEST")
      );
    }

    // Veri doğrulama
    try {
      const validatedData = logSchema.parse(body);
      
      // Log'u kaydet
      const log = await prisma.log.create({
        data: {
          level: validatedData.level,
          module: validatedData.module,
          action: validatedData.action,
          message: validatedData.message,
          timestamp: new Date(validatedData.timestamp),
          path: validatedData.path,
          user_id: validatedData.userId,
          error: validatedData.error,
          metadata: validatedData.metadata,
        },
      });

      return apiResponse.success({ 
        message: 'Log kaydedildi',
        logId: log.id 
      });

    } catch (validationError) {
      console.error('Validasyon hatası:', validationError);
      return apiResponse.error(
        new APIError("Geçersiz log verisi", 400, "VALIDATION_ERROR")
      );
    }
    
  } catch (error) {
    console.error('Log kaydetme hatası:', error);
    return apiResponse.error(
      new APIError("Log kaydedilirken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR")
    );
  }
}