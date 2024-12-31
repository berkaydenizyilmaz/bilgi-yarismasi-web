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
import { useState } from "react"
import * as z from "zod"

// Form validasyon şeması
const formSchema = z.object({
  name: z.string().min(2, {
    message: "İsim en az 2 karakter olmalıdır.",
  }),
  email: z.string().email({
    message: "Geçerli bir email adresi giriniz.",
  }),
  message: z.string().min(10, {
    message: "Mesaj en az 10 karakter olmalıdır.",
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
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(data.error || "Bir hata oluştu")
      }
  
      setSuccess("Mesajınız başarıyla gönderildi!")
      form.reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Bir hata oluştu")
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-orange-600">İletişim</h2>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              Bizimle iletişime geçmek için aşağıdaki formu doldurun
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İsim</FormLabel>
                    <FormControl>
                      <Input placeholder="Adınız Soyadınız" {...field} />
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
                      <Input placeholder="ornek@email.com" {...field} />
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
                      <Textarea 
                        placeholder="Mesajınızı buraya yazın..." 
                        className="min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm">
                  {success}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                Gönder
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}