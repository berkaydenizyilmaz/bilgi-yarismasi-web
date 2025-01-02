import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new APIError("Gemini API anahtarı bulunamadı", 500);
}

const genAI = new GoogleGenerativeAI(apiKey);

const cleanJsonResponse = (text: string): string => {
  try {
    // Markdown işaretlerini kaldır
    text = text.replace(/```json\s*|\s*```/g, "").trim();
    
    // JSON formatını düzelt
    text = text.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    text = text.replace(/:\s*([a-zA-Z][a-zA-Z0-9_]*)\s*([,}])/g, ':"$1"$2');
    
    // JSON içeriğini bul
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON içeriği bulunamadı");
    
    // JSON'ı parse et ve tekrar stringify yap
    const parsed = JSON.parse(jsonMatch[0]);
    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error("JSON temizleme hatası: " + (error instanceof Error ? error.message : String(error)));
  }
};

const validateQuestions = (questions: any[]) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Geçerli soru listesi bulunamadı");
  }

  questions.forEach((q, index) => {
    if (!q.question || !q.options || !q.correct_option) {
      throw new Error(`Soru ${index + 1} geçersiz format`);
    }

    const options = q.options;
    if (!options.A || !options.B || !options.C || !options.D) {
      throw new Error(`Soru ${index + 1}'de eksik şıklar var`);
    }

    if (!['A', 'B', 'C', 'D'].includes(q.correct_option)) {
      throw new Error(`Soru ${index + 1}'de geçersiz doğru cevap`);
    }
  });

  return questions;
};

async function getCategoryName(categoryId: number): Promise<string> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { name: true }
  });

  if (!category) {
    throw new APIError("Kategori bulunamadı", 404);
  }

  return category.name;
}

logger.info('ai', 'error', 'API yapılandırması', {
  hasApiKey: !!process.env.GEMINI_API_KEY,
  apiKeyLength: process.env.GEMINI_API_KEY?.length || 0
});

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
    const { category } = body;

    if (!category) {
      throw new APIError("Kategori belirtilmedi", 400);
    }

    const categoryText = await getCategoryName(Number(category));
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // AI isteği başlangıç logu
    logger.info('ai', 'generate', `AI soru üretimi başladı - Kategori: ${categoryText}`, {
      categoryId: category,
      categoryName: categoryText
    });

    const prompt = `Lütfen "${categoryText}" konusunda 10 adet çoktan seçmeli soru üret.
    Her soru için:
    - Soru Türkçe olmalı ve "${categoryText}" konusuyla doğrudan ilgili olmalı
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

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanedJson = cleanJsonResponse(text);
        const jsonData = JSON.parse(cleanedJson);
        const validatedQuestions = validateQuestions(jsonData.questions);

        // Başarılı üretim logu
        logger.info('ai', 'generate', `Sorular başarıyla üretildi`, {
          categoryId: category,
          categoryName: categoryText,
          questionCount: validatedQuestions.length
        });

        return apiResponse.success({ questions: validatedQuestions });
      } catch (error) {
        retryCount++;
        
        // Her başarısız deneme için log
        logger.error('ai', error as Error, {
          action: 'generate',
          categoryId: category,
          categoryName: categoryText,
          retryCount,
          errorType: 'AI_GENERATION_ERROR',
          errorContext: 'generate_questions'
        });

        if (retryCount === maxRetries) {
          throw new APIError("Sorular oluşturulamadı, lütfen tekrar deneyin", 500);
        }
      }
    }

  } catch (error) {
    // Genel hata logu
    logger.error('ai', error as Error, {
      action: 'generate',
      categoryId: body?.category,
      errorType: error instanceof APIError ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR',
      errorContext: 'ai_questions_endpoint',
      path: request.url
    });

    return apiResponse.error(
      error instanceof APIError ? error : new APIError("Beklenmeyen bir hata oluştu", 500)
    );
  }
}