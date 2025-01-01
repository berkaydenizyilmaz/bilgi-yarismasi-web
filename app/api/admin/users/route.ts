import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { checkAdminRole } from "@/lib/auth";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "15")
    const skip = (page - 1) * pageSize

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { created_at: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.user.count() // Toplam kullanıcı sayısı
    ]);

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
      new APIError("Kullanıcıları çekerken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR")
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  let deletedUser;

  try {
    await checkAdminRole(request);
    
    const user = await prisma.user.delete({
      where: { id: Number(id) },
    });

    // Silinen kullanıcının bilgilerini saklayalım
    deletedUser = user;

    // Kullanıcı silme logu
    logger.userDeleted(user.username, user.id);

    return apiResponse.success({ 
      message: "Kullanıcı başarıyla silindi", 
      user 
    });

  } catch (error) {
    // Hata durumunda log
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

interface UserUpdateData {
  username?: string;
  email?: string;
  role?: string;
}

export async function PUT(request: NextRequest) {
  let userId;
  let oldUsername;
  
  try {
    await checkAdminRole(request);
    
    const body = await request.json();
    const { id, ...updateData } = body as { id: number } & UserUpdateData;
    userId = id;

    // Güncellemeden önce mevcut kullanıcı bilgilerini alalım
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

    // Hangi alanların değiştiğini belirle
    const changedFields = Object.keys(updateData).filter(
      key => updateData[key as keyof UserUpdateData] !== existingUser[key as keyof UserUpdateData]
    );

    // Güncelleme logu
    logger.userUpdated(updatedUser.username, updatedUser.id, changedFields);

    return apiResponse.success({ 
      message: "Kullanıcı başarıyla güncellendi",
      user: updatedUser 
    });

  } catch (error) {
    // Hata durumunda log
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