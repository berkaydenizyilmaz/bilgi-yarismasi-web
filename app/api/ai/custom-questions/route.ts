import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const cleanJsonResponse = (text: string): string => {
  try {
    text = text.replace(/```json\s*|\s*```/g, "").trim();
    text = text.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    text = text.replace(/:\s*([a-zA-Z][a-zA-Z0-9_]*)\s*([,}])/g, ':"$1"$2');
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON içeriği bulunamadı");
    
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category } = body;

    if (!category) {
      throw new APIError("Kategori belirtilmedi", 400);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `"${category}" konusunda 10 adet özgün çoktan seçmeli soru üret.

    Önemli kurallar:
    1. Her soru benzersiz ve özgün olmalı, birbirini tekrar etmemeli
    2. Sorular farklı zorluk seviyelerinde olmalı (kolay, orta, zor)
    3. Her sorunun kesinlikle tek bir doğru cevabı olmalı
    4. Yanlış şıklar mantıklı ama açıkça yanlış olmalı
    5. Şıklar kısa ve net olmalı, birbirine çok benzer olmamalı
    6. Sorular test etme, anlama ve uygulama becerilerini ölçmeli
    7. Her soru Türkçe dilbilgisi kurallarına uygun olmalı
    8. Sorular kullanıcının girdiği "${category}" konusuyla doğrudan ilgili olmalı

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

        return apiResponse.success({ questions: validatedQuestions });
      } catch (error) {
        retryCount++;

        logger.error('ai', error as Error, {
          errorType: 'AI_GENERATION_ERROR',
          errorContext: 'generate_custom_questions',
          category,
          retryCount
        });

        if (retryCount === maxRetries) {
          throw new APIError("Sorular oluşturulamadı, lütfen tekrar deneyin", 500);
        }
      }
    }

  } catch (error) {
    logger.error('ai', error as Error, {
      errorType: error instanceof APIError ? 'VALIDATION_ERROR' : 'AI_ERROR',
      errorContext: 'ai_custom_questions_endpoint',
      path: request.url
    });

    return apiResponse.error(
      error instanceof APIError ? error : new APIError("Beklenmeyen bir hata oluştu", 500)
    );
  }
}