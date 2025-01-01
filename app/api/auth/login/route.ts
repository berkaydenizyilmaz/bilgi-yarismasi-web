import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import { APIError, ValidationError, AuthenticationError } from "@/lib/errors";
import bcrypt from 'bcrypt';
import { signJWT } from "@/lib/jwt";
import { logger } from "@/lib/logger"; 

const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export async function POST(request: NextRequest) {
  let body: z.infer<typeof loginSchema> | undefined;

  try {
    
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError("Geçersiz istek formatı");
    }

    loginSchema.parse(body);
    const validatedBody = body as z.infer<typeof loginSchema>;

    const user = await prisma.user.findUnique({
      where: { email: validatedBody.email },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        password_hash: true,
      },
    });

    if (!user) {
      logger.warn('auth', 'auth', 'Başarısız giriş denemesi: Kullanıcı bulunamadı', { 
        email: validatedBody.email 
      });
      throw new AuthenticationError("Email veya şifre hatalı");
    }

    const passwordMatch = await bcrypt.compare(validatedBody.password, user.password_hash);

    if (!passwordMatch) {
      logger.warn('auth', 'auth', 'Başarısız giriş denemesi: Yanlış şifre', { 
        userId: user.id,
        email: user.email 
      });
      throw new AuthenticationError("Email veya şifre hatalı");
    }

    const token = signJWT({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    logger.authLog('login', 'Başarılı giriş', {
      userId: user.id,
      email: user.email
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
    logger.error('auth', error as Error, {
      email: body?.email,
      errorType: error instanceof ValidationError ? 'VALIDATION_ERROR' : 'AUTH_ERROR',
      errorContext: 'login_attempt'
    });

    if (body?.email) {
      logger.warn('auth', 'auth', 'Başarısız giriş denemesi', {
        email: body.email,
        reason: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }

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