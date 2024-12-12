import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { created_at: "desc" }, // En yeni kullanıcılar önce
    });

    return apiResponse.success({ users });
  } catch (error) {
    return apiResponse.error(new APIError("Kullanıcıları çekerken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR"));
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    const user = await prisma.user.delete({
      where: { id: Number(id) },
    });

    // Log kaydı
    logger.info('Kullanıcı silindi', {
      userId: user.id,
      username: user.username,
      action: 'delete'
    });

    return apiResponse.success({ message: "Kullanıcı başarıyla silindi", user });
  } catch (error) {
    return apiResponse.error(new APIError("Kullanıcı silinirken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR"));
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
        role: body.role, // Rolü de güncelle
      },
    });

    // Log kaydı
    logger.info('Kullanıcı güncellendi', {
      userId: user.id,
      username: user.username,
      action: 'update',
      updatedFields: { email: body.email, role: body.role }
    });

    return apiResponse.success({ message: "Kullanıcı başarıyla güncellendi", user });
  } catch (error) {
    return apiResponse.error(new APIError("Kullanıcı güncellenirken bir hata oluştu", 500, "INTERNAL_SERVER_ERROR"));
  }
}