"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const questionSchema = z.object({
  questionText: z.string().min(1, "Soru metni boş olamaz."),
  optionA: z.string().min(1, "Seçenek A boş olamaz."),
  optionB: z.string().min(1, "Seçenek B boş olamaz."),
  optionC: z.string().min(1, "Seçenek C boş olamaz."),
  optionD: z.string().min(1, "Seçenek D boş olamaz."),
  correctOption: z.enum(["A", "B", "C", "D"], {
    errorMap: () => ({ message: "Doğru seçenek seçilmelidir." }),
  }),
  categoryId: z.number().int().positive("Geçerli bir kategori ID'si girin."),
});

export default function AddQuestionPage() {
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>(""); // Başarı mesajı için durum
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
      categoryId: 1,
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();

        if (data.success && Array.isArray(data.data.data)) {
          setCategories(data.data.data);
        } else {
          throw new Error("Kategoriler dizisi bekleniyordu.");
        }
      } catch (error) {
        console.error("Kategoriler alınamadı:", error);
        setError("Kategoriler alınamadı.");
      }
    };

    fetchCategories();
  }, []);

  async function onSubmit(values: z.infer<typeof questionSchema>) {
    setIsLoading(true);
    setError("");
    setSuccessMessage(""); // Önceki başarı mesajını sıfırla

    try {
      const categoryId = Number(values.categoryId);

      const response = await fetch("/api/add-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          categoryId,
        }),
      });

      if (!response.ok) {
        throw new Error("Soru eklenirken bir hata oluştu.");
      }

      form.reset();
      setSuccessMessage("Soru başarıyla eklendi!"); // Başarı mesajını ayarla
    } catch (error) {
      setError(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6 my-10 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-center">Soru Ekle</h1>
      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
      {successMessage && <div className="text-green-500 mb-4 text-center">{successMessage}</div>} {/* Başarı mesajı */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="questionText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soru Metni</FormLabel>
                <FormControl>
                  <Textarea placeholder="Soru metnini buraya yazın" {...field} className="border rounded p-2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="optionA"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seçenek A</FormLabel>
                <FormControl>
                  <Input placeholder="Seçenek A" {...field} className="border rounded p-2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="optionB"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seçenek B</FormLabel>
                <FormControl>
                  <Input placeholder="Seçenek B" {...field} className="border rounded p-2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="optionC"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seçenek C</FormLabel>
                <FormControl>
                  <Input placeholder="Seçenek C" {...field} className="border rounded p-2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="optionD"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seçenek D</FormLabel>
                <FormControl>
                  <Input placeholder="Seçenek D" {...field} className="border rounded p-2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="correctOption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doğru Seçenek</FormLabel>
                <FormControl>
                  <select {...field} className="border rounded p-2">
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <FormControl>
                  <select {...field} className="border rounded p-2">
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 transition duration-300" disabled={isLoading}>
            {isLoading ? <LoadingSpinner className="w-5 h-5 mr-2" /> : "Soru Ekle"}
          </Button>
        </form>
      </Form>
    </div>
  );
}