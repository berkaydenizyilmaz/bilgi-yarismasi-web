import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { signJWT } from "@/lib/jwt";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import { APIError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Kayıt validasyon şeması
 */
const registerSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
  email: z.string().email("Geçerli bir email adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

/**
 * POST /api/auth/register
 * Yeni kullanıcı kaydı yapar
 * 
 * Veritabanı İşlemleri:
 * 1. Kullanıcı adı ve email benzersizlik kontrolü
 * 2. User tablosuna yeni kayıt ekler
 * 
 * İşlem Adımları:
 * 1. Request validasyonu
 * 2. Benzersizlik kontrolü
 * 3. Şifre hashleme
 * 4. Kullanıcı oluşturma
 * 5. JWT token oluşturma
 */
export async function POST(request: NextRequest) {
  let userData;
  
  try {
    // Request body'i doğrula
    const body = await request.json();
    userData = registerSchema.parse(body);
    
    // Kullanıcı adı ve email kontrolü
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: userData.username },
          { email: userData.email }
        ]
      },
      select: {
        username: true,
        email: true
      }
    });

    if (existingUser) {
      if (existingUser.username === userData.username) {
        logger.warn('auth', 'auth', 'Kayıt denemesi: Kullanıcı adı kullanımda', {
          username: userData.username
        });
        throw new ValidationError("Bu kullanıcı adı zaten kullanılıyor");
      }
      if (existingUser.email === userData.email) {
        logger.warn('auth', 'auth', 'Kayıt denemesi: Email kullanımda', {
          email: userData.email
        });
        throw new ValidationError("Bu email adresi zaten kullanılıyor");
      }
    }
    
    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password_hash: await bcrypt.hash(userData.password, 10),
        role: 'user'
      }
    });

    // JWT token oluştur
    const token = signJWT({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    // Başarılı kayıt logu
    logger.userCreated(user.username, user.id);

    // Cookie ile yanıt döndür
    return apiResponse.successWithCookie(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      "Kayıt başarılı",
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
      action: 'register',
      username: userData?.username,
      errorType: error instanceof z.ZodError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR'
    });

    if (error instanceof z.ZodError) {
      return apiResponse.error(new ValidationError(error.errors[0].message));
    }

    if (error instanceof ValidationError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError("Kayıt işlemi başarısız oldu", 500)
    );
  }
}