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
  let body: z.infer<typeof registerSchema> | undefined;

  try {

    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError("Geçersiz istek formatı");
    }

    registerSchema.parse(body);
    const validatedBody = body as z.infer<typeof registerSchema>;

    // Email kontrolü
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedBody.email },
          { username: validatedBody.username }
        ]
      }
    });

    if (existingUser) {
      throw new ValidationError("Bu email veya kullanıcı adı zaten kullanımda");
    }

    const hashedPassword = await bcrypt.hash(validatedBody.password, 10);

    const user = await prisma.user.create({
      data: {
        email: validatedBody.email,
        username: validatedBody.username,
        password_hash: hashedPassword,
        last_login: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
      }
    });

    logger.info('Yeni kullanıcı kaydı başarılı', {
      userId: user.id,
      email: user.email,
      username: user.username
    });

    const token = signJWT({
      id: user.id,
      email: user.email,
      username: user.username,
      role: "user" 
    });

    return apiResponse.successWithCookie(
      { user },
      "Kayıt başarılı",
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
    logger.error(error as Error, {
      path: request.url,
      email: body?.email,
      username: body?.username
    });

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