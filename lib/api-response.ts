import { APIError } from "./errors";
import { NextResponse } from "next/server";
import { Cookie } from "@/types/cookie";

class ApiResponse {
  success(data: any, message?: string) {
    return NextResponse.json({
      success: true,
      message: message || "İşlem başarılı",
      data: data,
    });
  }

  successWithCookie(data: any, message: string, cookies: Cookie[]) {
    const response = NextResponse.json({
      success: true,
      message: message,
      data: data,
    });

    cookies.forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    });

    return response;
  }

  error(error: APIError | string, status?: number) {
    if (error instanceof APIError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.message,
            code: error.code
          }
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error,
          code: "UNKNOWN_ERROR"
        }
      },
      { status: status || 500 }
    );
  }
}

export const apiResponse = new ApiResponse();