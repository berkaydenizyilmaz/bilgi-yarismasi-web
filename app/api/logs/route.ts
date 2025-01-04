import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { z } from 'zod';
import { APIError } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * Log verisi için validasyon şeması
 */
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

/**
 * POST /api/logs
 * Sistem logu kaydeder
 * 
 * Veritabanı İşlemleri:
 * - Log tablosuna yeni kayıt ekler
 * - Timestamp otomatik oluşturulur
 * - İlişkili kullanıcı varsa user_id ile bağlanır
 * 
 * Request Body:
 * - level: Log seviyesi (info/warn/error)
 * - module: İlgili modül
 * - action: Yapılan işlem
 * - message: Log mesajı
 * - timestamp: Zaman damgası
 * - path?: İstek yolu
 * - userId?: Kullanıcı ID
 * - error?: Hata detayı
 * - metadata?: Ek bilgiler
 */
export async function POST(request: NextRequest) {
  try {
    // Request body'yi parse et
    let body;
    try {
      body = await request.json();
    } catch (e) {
      logger.error('system', e as Error, {
        action: 'create',
        errorType: 'PARSE_ERROR',
        errorContext: 'parse_log_body'
      });
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
      logger.error('system', validationError as Error, {
        action: 'create',
        errorType: 'VALIDATION_ERROR',
        errorContext: 'validate_log_data'
      });
      return apiResponse.error(
        new APIError("Geçersiz log verisi", 400, "VALIDATION_ERROR")
      );
    }
    
  } catch (error) {
    logger.error('system', error as Error, {
      action: 'create',
      errorType: 'INTERNAL_ERROR',
      errorContext: 'create_log'
    });
    return apiResponse.error(
      new APIError("Log kaydedilirken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR")
    );
  }
}