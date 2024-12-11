import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: number;
  email: string;
  username: string;
}

// Kullanıcı bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return apiResponse.error("Oturum bulunamadı", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        total_play_count: true,
        total_score: true,
        created_at: true,
      },
    });

    if (!user) {
      return apiResponse.error("Kullanıcı bulunamadı", 404);
    }

    return apiResponse.success({ user });
  } catch (error) {
    console.error("Auth check error:", error);
    return apiResponse.error("Oturum doğrulanamadı", 401);
  }
}