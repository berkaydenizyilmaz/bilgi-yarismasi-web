import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { signJWT } from "@/lib/jwt";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        username: true,
        password_hash: true,
      },
    });

    if (!user) {
      return apiResponse.error("Email veya şifre hatalı", 401);
    }

    const passwordMatch = await bcrypt.compare(
      validatedData.password,
      user.password_hash
    );

    if (!passwordMatch) {
      return apiResponse.error("Email veya şifre hatalı", 401);
    }

    const token = signJWT({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    const response = apiResponse.success(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      "Giriş başarılı"
    );

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponse.error(error.errors[0].message, 400);
    }
    console.error("Login error:", error);
    return apiResponse.error("Giriş yapılırken bir hata oluştu", 500);
  }
} 