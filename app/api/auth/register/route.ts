import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { signJWT } from "@/lib/jwt";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import { APIError, ValidationError } from "@/lib/errors";

const registerSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
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
      registerSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.errors[0].message);
      }
      throw error;
    }

    // Email ve kullanıcı adı kontrolü
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.email },
          { username: body.username }
        ]
      },
      select: {
        email: true,
        username: true
      }
    }).catch((error) => {
      console.error("Database error:", error);
      throw new APIError("Veritabanı hatası", 500, "DATABASE_ERROR");
    });

    if (existingUser) {
      if (existingUser.email === body.email) {
        throw new ValidationError("Bu email adresi zaten kullanımda");
      }
      if (existingUser.username === body.username) {
        throw new ValidationError("Bu kullanıcı adı zaten kullanımda");
      }
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(body.password, 10).catch(() => {
      throw new APIError("Şifre hashleme hatası", 500);
    });

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        password_hash: hashedPassword,
        last_login: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    }).catch((error) => {
      console.error("User creation error:", error);
      throw new APIError("Kullanıcı oluşturma hatası", 500, "DATABASE_ERROR");
    });

    // Token oluştur
    const token = signJWT({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return apiResponse.successWithCookie(
      { user },
      "Kayıt başarıyla tamamlandı",
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
    console.error("Register error:", error);

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