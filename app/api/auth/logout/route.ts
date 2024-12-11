import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const response = apiResponse.success(null, "Çıkış başarılı");
    
    // Token cookie'sini temizle
    response.cookies.set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Hemen sona erdir
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return apiResponse.error("Çıkış yapılırken bir hata oluştu", 500);
  }
}