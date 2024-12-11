import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { signJWT } from "@/lib/jwt";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
  email: z.string().email("Geçerli bir email adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Email kontrolü
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return apiResponse.error("Bu email adresi zaten kullanımda", 400);
    }

    // Kullanıcı adı kontrolü
    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUsername) {
      return apiResponse.error("Bu kullanıcı adı zaten kullanımda", 400);
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        password_hash: hashedPassword,
        last_login: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    // Token oluştur
    const token = signJWT({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    const response = apiResponse.success(
      { user },
      "Kayıt başarıyla tamamlandı"
    );

    // Token'ı cookie olarak ayarla
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

    console.error("Register error:", error);
    return apiResponse.error("Kayıt işlemi sırasında bir hata oluştu", 500);
  }
}