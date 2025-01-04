import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import { APIError, ValidationError, AuthenticationError } from "@/lib/errors";
import bcrypt from 'bcrypt';
import { signJWT } from "@/lib/jwt";
import { logger } from "@/lib/logger"; 

/**
 * Giriş validasyon şeması
 */
const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

/**
 * POST /api/auth/login
 * Kullanıcı girişi yapar
 * 
 * Veritabanı İşlemleri:
 * 1. Email ile kullanıcıyı bulur
 * 2. Şifre kontrolü yapar
 * 3. Son giriş tarihini günceller
 * 
 * İşlem Adımları:
 * 1. Request validasyonu
 * 2. Kullanıcı kontrolü
 * 3. Şifre doğrulama
 * 4. JWT token oluşturma
 * 5. Son giriş güncelleme
 */
export async function POST(request: NextRequest) {
  let body: z.infer<typeof loginSchema> | undefined;

  try {
    // Request body'i al ve doğrula
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError("Geçersiz istek formatı");
    }

    loginSchema.parse(body);
    const validatedBody = body as z.infer<typeof loginSchema>;

    // Kullanıcıyı bul
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

    // Şifre kontrolü
    const passwordMatch = await bcrypt.compare(validatedBody.password, user.password_hash);

    if (!passwordMatch) {
      logger.warn('auth', 'auth', 'Başarısız giriş denemesi: Yanlış şifre', { 
        userId: user.id,
        email: user.email 
      });
      throw new AuthenticationError("Email veya şifre hatalı");
    }

    // JWT token oluştur
    const token = signJWT({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    // Son giriş tarihini güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    // Başarılı giriş logu
    logger.authLog('login', 'Başarılı giriş', {
      userId: user.id,
      email: user.email
    });

    // Cookie ile yanıt döndür
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
          maxAge: 60 * 60 * 24, // 24 saat
        }
      }]
    );

  } catch (error) {
    // Hata logu
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