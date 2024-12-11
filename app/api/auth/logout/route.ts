import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    // Token'ı temizle
    return apiResponse.successWithCookie(
      null,
      "Çıkış başarılı",
      [{
        name: "token",
        value: "",
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0, // Cookie'yi hemen sil
        }
      }]
    );

  } catch (error) {
    console.error("Logout error:", error);

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Çıkış yapılırken bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}