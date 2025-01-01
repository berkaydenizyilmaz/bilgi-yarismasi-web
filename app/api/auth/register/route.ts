import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { signJWT } from "@/lib/jwt";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import { APIError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";


const registerSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
  email: z.string().email("Geçerli bir email adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export async function POST(request: NextRequest) {
  let userData;
  
  try {
    const body = await request.json();
    userData = registerSchema.parse(body);
    
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password_hash: await bcrypt.hash(userData.password, 10),
        role: 'user'
      }
    });

    // Kullanıcı oluşturma logunu ekleyelim
    logger.userCreated(user.username, user.id);

    return apiResponse.success({
      message: "Kayıt başarılı"
    });

  } catch (error) {
    // Hata durumunda log kaydı
    logger.error('auth', error as Error, {
      action: 'register',
      username: userData?.username,
      errorType: error instanceof z.ZodError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR'
    });

    if (error instanceof z.ZodError) {
      return apiResponse.error(new ValidationError(error.errors[0].message));
    }

    return apiResponse.error(
      new APIError("Kayıt işlemi başarısız oldu", 500)
    );
  }
}