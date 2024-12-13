"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Adınızı giriniz.",
  }),
  email: z.string().email({
    message: "Geçerli bir email adresi giriniz.",
  }),
  message: z.string().min(10, {
    message: "Mesajınız en az 10 karakter olmalıdır.",
  }),
})

export default function ContactPage() {
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Bir hata oluştu");
      }
  
      setSuccess("Mesajınız başarıyla gönderildi!");
      form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Bir hata oluştu");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50"> {/* Arka plan rengi turuncu tonlarıyla uyumlu hale getirildi */}
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg border border-gray-300">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-orange-600">İletişim</h2>
          <p className="mt-2 text-sm text-gray-600">
            Bizimle iletişime geçmek için aşağıdaki formu doldurun.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-500">
            {success}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adınız</FormLabel>
                  <FormControl>
                    <Input placeholder="Adınızı girin" {...field} className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ornek@mail.com" {...field} className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mesajınız</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mesajınızı buraya yazın" {...field} className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 transition duration-300">Gönder</Button>
          </form>
        </Form>
      </div>
    </div>
  )
}