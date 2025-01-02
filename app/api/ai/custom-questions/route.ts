import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const cleanJsonResponse = (text: string): string => {
  // JSON içeriğini bul
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON içeriği bulunamadı");
  
  return jsonMatch[0];
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category } = body;

    if (!category) {
      throw new APIError("Kategori belirtilmedi", 400);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Lütfen "${category}" konusunda 10 adet çoktan seçmeli soru üret.
    Her soru için:
    - Soru Türkçe olmalı ve "${category}" konusuyla doğrudan ilgili olmalı
    - 4 şık olmalı (A,B,C,D)
    - Tek bir doğru cevap olmalı
    - Şıklar kısa ve net olmalı
    
    Yanıtı tam olarak aşağıdaki JSON formatında ver (başka metin ekleme):
    {
      "questions": [
        {
          "question": "soru metni",
          "options": {
            "A": "birinci şık",
            "B": "ikinci şık",
            "C": "üçüncü şık",
            "D": "dördüncü şık"
          },
          "correct_option": "A"
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const cleanJson = cleanJsonResponse(text);
      const parsedData = JSON.parse(cleanJson);

      if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
        throw new Error("Geçersiz soru formatı");
      }

      const validatedQuestions = parsedData.questions.map((q: any, index: number) => {
        if (!q.question || !q.options || !q.correct_option) {
          throw new Error(`Soru ${index + 1} için eksik veri`);
        }

        const options = q.options;
        if (!options.A || !options.B || !options.C || !options.D) {
          throw new Error(`Soru ${index + 1} için eksik şıklar`);
        }

        const correctOption = q.correct_option.toUpperCase();
        if (!['A', 'B', 'C', 'D'].includes(correctOption)) {
          throw new Error(`Soru ${index + 1} için geçersiz doğru cevap`);
        }

        return {
          question: String(q.question).trim(),
          options: {
            A: String(options.A).trim(),
            B: String(options.B).trim(),
            C: String(options.C).trim(),
            D: String(options.D).trim()
          },
          correct_option: correctOption
        };
      });

      if (validatedQuestions.length !== 10) {
        throw new Error("Soru sayısı 10 olmalıdır");
      }

      logger.aiInfo("Özel kategori soruları başarıyla üretildi", {
        category,
        questionCount: validatedQuestions.length
      });

      return apiResponse.success({ questions: validatedQuestions });

    } catch (parseError) {
      logger.error('ai', parseError as Error, {
        action: 'parse',
        errorType: 'JSON_PARSE_ERROR',
        rawResponse: text,
        errorContext: 'parse_custom_questions'
      });
      throw new APIError("Üretilen sorular geçerli JSON formatında değil", 500);
    }

  } catch (error) {
    logger.error('ai', error as Error, {
      action: 'generate',
      errorType: error instanceof APIError ? error.code : 'INTERNAL_SERVER_ERROR',
      errorContext: 'generate_custom_questions'
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError("Sorular üretilirken bir hata oluştu", 500)
    );
  }
}