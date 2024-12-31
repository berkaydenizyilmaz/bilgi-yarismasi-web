import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken';
import { AuthenticationError } from "./errors";

interface JWTPayload {
  id: number;
  role: string;
}

export async function checkAdminRole(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  
  if (!token) {
    throw new AuthenticationError("Oturum bulunamadı");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    if (decoded.role !== "admin") {
      throw new AuthenticationError("Bu işlem için admin yetkisi gereklidir");
    }

    return decoded;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError("Geçersiz veya süresi dolmuş oturum");
  }
}