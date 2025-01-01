import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";

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

  try {
    const user = await prisma.user.delete({
      where: { id: Number(id) },
    });

    logger.userDeleted(user.username, user.id, {
      action: 'admin_delete',
      deletedAt: new Date().toISOString()
    });

    return apiResponse.success({ message: "Kullanıcı başarıyla silindi", user });
  } catch (error) {
    logger.error('user', error as Error, {
      userId: id,
      action: 'delete_attempt'
    });
    return apiResponse.error(
      new APIError("Kullanıcı silinirken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR")
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const body = await request.json();

  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        username: body.username,
        email: body.email,
        role: body.role, 
      },
    });

    logger.info('user', 'update', `Kullanıcı güncellendi: ${user.username}`, {
      userId: user.id,
      username: user.username,
      updatedFields: { 
        email: body.email, 
        role: body.role 
      }
    });

    return apiResponse.success({ message: "Kullanıcı başarıyla güncellendi", user });
  } catch (error) {
    logger.error('user', error as Error, {
      action: 'update_attempt',
      userId: id,
      updatedFields: body
    });

    return apiResponse.error(
      new APIError("Kullanıcı güncellenirken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR")
    );
  }
}