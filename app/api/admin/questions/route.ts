import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { APIError, ValidationError } from "@/lib/errors";
import { checkAdminRole } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Soru validasyon şeması
 * questionText: Soru metni (zorunlu)
 * optionA/B/C/D: Şıklar (zorunlu)
 * correctOption: Doğru cevap (A,B,C,D)
 * categoryId: Kategori ID (pozitif sayı)
 */
const questionSchema = z.object({
  questionText: z.string().min(1, "Soru metni gereklidir"),
  optionA: z.string().min(1, "A şıkkı gereklidir"),
  optionB: z.string().min(1, "B şıkkı gereklidir"),
  optionC: z.string().min(1, "C şıkkı gereklidir"),
  optionD: z.string().min(1, "D şıkkı gereklidir"),
  correctOption: z.enum(["A", "B", "C", "D"]),
  categoryId: z.number().positive()
});

/**
 * GET /api/admin/questions
 * Soruları listeler (sayfalama, arama ve kategori filtresi ile)
 * 
 * Query Parametreleri:
 * - page: Sayfa numarası (varsayılan: 1)
 * - search: Soru metninde arama
 * - category: Kategori ID'sine göre filtreleme
 * 
 * Veritabanı İşlemleri:
 * - Question tablosundan filtrelenmiş ve sayfalı veri çeker
 * - İlgili kategori bilgilerini include eder
 * - Yeni eklenen sorular başta olacak şekilde sıralar
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category");
  
  try {
    await checkAdminRole(request);

    const limit = 10; // Sayfa başına soru sayısı
    const offset = (page - 1) * limit;

    // Filtreleme koşulları
    const where = {
      ...(search && {
        question_text: {
          contains: search,
          mode: 'insensitive' as const
        }
      }),
      ...(category && category !== "all" && {
        category_id: parseInt(category)
      })
    };

    // Soruları ve toplam sayıyı paralel olarak çek
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          category: {
            select: { name: true }
          }
        },
        orderBy: { id: 'desc' }
      }),
      prisma.question.count({ where })
    ]);

    // Response formatını düzenle
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      questionText: q.question_text,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      correctOption: q.correct_option,
      categoryId: q.category_id,
      categoryName: q.category.name
    }));

    // Başarılı listeleme logu
    logger.info('question', 'list', 'Sorular listelendi', {
      total,
      page,
      search: search || undefined,
      categoryFilter: category || undefined
    });

    return apiResponse.success({
      questions: formattedQuestions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    logger.error('question', error as Error, {
      action: 'list_attempt',
      search,
      category,
      page
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }
    return apiResponse.error(
      new APIError("Sorular alınırken bir hata oluştu", 500)
    );
  }
}

/**
 * POST /api/admin/questions
 * Yeni soru ekler
 * 
 * Veritabanı İşlemleri:
 * - Önce kategori varlığını kontrol eder
 * - Question tablosuna yeni kayıt ekler
 */
export async function POST(request: NextRequest) {
  let categoryName = '';
  
  try {
    await checkAdminRole(request);

    const body = await request.json();
    const validatedData = questionSchema.parse(body);

    // Kategori kontrolü
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
      select: { name: true }
    });

    if (!category) {
      throw new APIError("Kategori bulunamadı", 404);
    }

    categoryName = category.name;

    // Soruyu oluştur
    const question = await prisma.question.create({
      data: {
        question_text: validatedData.questionText,
        option_a: validatedData.optionA,
        option_b: validatedData.optionB,
        option_c: validatedData.optionC,
        option_d: validatedData.optionD,
        correct_option: validatedData.correctOption,
        category_id: validatedData.categoryId
      }
    });

    // Başarılı oluşturma logu
    logger.questionCreated(question.id, categoryName);

    return apiResponse.success(question);

  } catch (error) {
    logger.error('question', error as Error, {
      action: 'create',
      categoryName,
      errorType: error instanceof z.ZodError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR',
      errorContext: 'create_question'
    });

    if (error instanceof z.ZodError) {
      return apiResponse.error(new ValidationError(error.errors[0].message));
    }

    return apiResponse.error(
      new APIError("Soru eklenirken bir hata oluştu", 500)
    );
  }
}
