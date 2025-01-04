import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { checkAdminRole } from "@/lib/auth";
import { z } from "zod";

/**
 * Kullanıcı güncelleme validasyon şeması
 */
const userUpdateSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  role: z.enum(["USER", "ADMIN"]).optional()
});

/**
 * GET /api/admin/users
 * Kullanıcıları listeler (sayfalama ile)
 * 
 * Query Parametreleri:
 * - page: Sayfa numarası (varsayılan: 1)
 * - pageSize: Sayfa başına kullanıcı sayısı (varsayılan: 15)
 * 
 * Veritabanı İşlemleri:
 * - User tablosundan sayfalı veri çeker
 * - Oluşturulma tarihine göre azalan sırada listeler
 */
export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);

    // Sayfalama parametrelerini al
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "15")
    const skip = (page - 1) * pageSize

    // Kullanıcıları ve toplam sayıyı paralel olarak çek
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { created_at: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.user.count()
    ]);

    // Başarılı listeleme logu
    logger.info('user', 'list', 'Kullanıcılar listelendi', {
      total,
      page,
      pageSize
    });

    return apiResponse.success({ 
      users,
      total,
      page,
      pageSize
    });

  } catch (error) {
    logger.error('user', error as Error, {
      action: 'list_attempt',
      path: request.url
    });

    return apiResponse.error(
      new APIError(
        "Kullanıcıları çekerken bir hata oluştu", 
        500, 
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}

/**
 * DELETE /api/admin/users?id=[id]
 * Kullanıcıyı siler
 * 
 * Query Parametreleri:
 * - id: Silinecek kullanıcının ID'si
 * 
 * Veritabanı İşlemleri:
 * - User tablosundan kaydı siler
 * - Cascade ile ilişkili kayıtlar da silinir
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  let deletedUser;

  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);
    
    // Kullanıcıyı sil
    const user = await prisma.user.delete({
      where: { id: Number(id) },
    });

    // Silinen kullanıcının bilgilerini sakla
    deletedUser = user;

    // Başarılı silme logu
    logger.userDeleted(user.username, user.id);

    return apiResponse.success({ 
      message: "Kullanıcı başarıyla silindi", 
      user 
    });

  } catch (error) {
    logger.error('user', error as Error, {
      action: 'delete',
      userId: id,
      username: deletedUser?.username,
      errorType: 'DATABASE_ERROR'
    });

    return apiResponse.error(
      new APIError("Kullanıcı silinirken bir hata oluştu", 500)
    );
  }
}

/**
 * PUT /api/admin/users
 * Kullanıcı bilgilerini günceller
 * 
 * Request Body:
 * - id: Güncellenecek kullanıcının ID'si
 * - username?: Yeni kullanıcı adı
 * - email?: Yeni email adresi
 * - role?: Yeni rol (USER/ADMIN)
 * 
 * Veritabanı İşlemleri:
 * - User tablosunda güncelleme yapar
 * - Değişen alanları takip eder
 */
export async function PUT(request: NextRequest) {
  let userId;
  let oldUsername;
  
  try {
    // Admin yetkisi kontrolü
    await checkAdminRole(request);
    
    // Request body'i doğrula
    const body = await request.json();
    const { id, ...updateData } = body as { id: number } & z.infer<typeof userUpdateSchema>;
    userId = id;

    // Mevcut kullanıcıyı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if (!existingUser) {
      throw new APIError("Kullanıcı bulunamadı", 404);
    }

    oldUsername = existingUser.username;

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData
    });

    // Değişen alanları belirle
    const changedFields = Object.keys(updateData).filter(
      key => updateData[key as keyof typeof updateData] !== existingUser[key as keyof typeof existingUser]
    );

    // Başarılı güncelleme logu
    logger.userUpdated(updatedUser.username, updatedUser.id, changedFields);

    return apiResponse.success({ 
      message: "Kullanıcı başarıyla güncellendi",
      user: updatedUser 
    });

  } catch (error) {
    logger.error('user', error as Error, {
      action: 'update',
      userId,
      oldUsername,
      errorType: error instanceof z.ZodError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR'
    });

    if (error instanceof z.ZodError) {
      return apiResponse.error(new ValidationError(error.errors[0].message));
    }

    return apiResponse.error(
      new APIError("Kullanıcı güncellenirken bir hata oluştu", 500)
    );
  }
}