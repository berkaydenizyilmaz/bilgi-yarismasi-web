import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { signJWT } from "@/lib/jwt";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import { AuthenticationError, APIError, ValidationError } from "@/lib/errors";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export async function POST(request: NextRequest) {
  try {
    // Request body'yi parse et
    let body;
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError("Geçersiz istek formatı");
    }

    // Zod validasyonu
    try {
      loginSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.errors[0].message);
      }
      throw error;
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: {
        id: true,
        email: true,
        username: true,
        password_hash: true,
      },
    }).catch((error) => {
      console.error("Database error:", error);
      throw new APIError("Veritabanı hatası", 500, "DATABASE_ERROR");
    });

    if (!user) {
      throw new AuthenticationError("Email veya şifre hatalı");
    }

    // Şifre kontrolü
    const passwordMatch = await bcrypt.compare(
      body.password,
      user.password_hash
    ).catch(() => {
      throw new APIError("Şifre karşılaştırma hatası", 500);
    });

    if (!passwordMatch) {
      throw new AuthenticationError("Email veya şifre hatalı");
    }

    // Token oluştur
    const token = signJWT({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    // Son giriş zamanını güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    }).catch((error) => {
      console.error("Last login update error:", error);
      // Bu hatayı yutabiliriz çünkü kritik değil
    });

    return apiResponse.successWithCookie(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      "Giriş başarılı",
      [{
        name: "token",
        value: token,
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24,
        }
      }]
    );

  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Beklenmeyen bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}