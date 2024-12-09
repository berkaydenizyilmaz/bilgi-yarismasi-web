import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { signJWT } from "@/lib/jwt";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import jwt from 'jsonwebtoken';

// JWT tipini tanımlayalım
interface JWTPayload {
  id: number;
  email: string;
  username: string;
}

// Validasyon şemaları
const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

const registerSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır."),
  email: z.string().email("Geçerli bir email adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return apiResponse.error("Yetkilendirme gerekli", 401);
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
        total_correct_answers: true,
        total_questions_attempted: true,
        created_at: true,
      },
    });

    if (!user) {
      return apiResponse.error("Kullanıcı bulunamadı", 404);
    }

    return apiResponse.success({
      user: {
        ...user,
        averageScore: user.total_questions_attempted > 0
          ? Math.round((user.total_correct_answers / user.total_questions_attempted) * 100)
          : 0,
      }
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return apiResponse.error("Oturum geçersiz", 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case "login":
        return handleLogin(data);
      case "register":
        return handleRegister(data);
      case "logout":
        return handleLogout();
      default:
        return apiResponse.error("Geçersiz işlem tipi");
    }
  } catch (error) {
    console.error("Auth error:", error);
    return apiResponse.error("Beklenmeyen bir hata oluştu");
  }
}

async function handleLogin(data: any) {
  try {
    const validatedData = loginSchema.parse(data);

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
      return apiResponse.error("Email veya şifre hatalı");
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return apiResponse.error("Email veya şifre hatalı");
    }

    const token = signJWT({
      id: user.id,
      email: user.email,
      username: user.username,
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
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 saat
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponse.error(error.errors[0].message);
    }
    throw error;
  }
}

async function handleRegister(data: any) {
  try {
    const validatedData = registerSchema.parse(data);

    // Email ve kullanıcı adı kontrolü
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
      },
    });

    if (existingUser) {
      return apiResponse.error(
        existingUser.email === validatedData.email
          ? "Bu email adresi zaten kullanımda"
          : "Bu kullanıcı adı zaten kullanımda"
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password_hash: hashedPassword,
      },
    });

    const token = signJWT({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    const response = apiResponse.success(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      "Kayıt başarılı"
    );

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponse.error(error.errors[0].message);
    }
    throw error;
  }
}

async function handleLogout() {
  const response = apiResponse.success(null, "Çıkış başarılı");
  
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  return response;
}