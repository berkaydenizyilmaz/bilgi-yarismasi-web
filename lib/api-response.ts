import { NextResponse } from "next/server";

type ApiResponse<T = any> = {
  data?: T;
  error?: string;
  message?: string;
};

export const apiResponse = {
  success: <T>(data: T, message?: string, status = 200) =>
    NextResponse.json(
      {
        data,
        message,
      } as ApiResponse<T>,
      { status }
    ),

  error: (error: string, status = 400) =>
    NextResponse.json(
      {
        error,
      } as ApiResponse,
      { status }
    ),
}; 