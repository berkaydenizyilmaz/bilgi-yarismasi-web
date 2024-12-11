import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api-response';
import { APIError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const logData = await request.json();

    await prisma.log.create({
      data: {
        level: logData.level,
        message: logData.message,
        timestamp: new Date(logData.timestamp),
        path: logData.path,
        user_id: logData.userId,
        error: logData.error,
        metadata: logData.metadata,
      },
    });

    return apiResponse.success({ message: 'Log kaydedildi' });
    
  } catch (error) {
    console.error('Log kaydetme hatası:', error);
    return apiResponse.error(
      new APIError('Log kaydedilemedi', 500, 'LOG_ERROR')
    );
  }
}