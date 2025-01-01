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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto my-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Sol taraf dekoratif bölüm */}
          <div className="grid md:grid-cols-5 gap-0">
            <div className="hidden md:block md:col-span-2 bg-orange-600 p-8 text-white">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Bizimle İletişime Geçin</h3>
                  <p className="text-orange-100 mb-6">
                    Sorularınız veya önerileriniz için bize ulaşın. En kısa sürede size dönüş yapacağız.
                  </p>
                </div>                
              </div>
            </div>

            {/* Sağ taraf form bölümü */}
            <div className="md:col-span-3 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">İletişim Formu</h2>
                <p className="mt-2 text-gray-600">Tüm alanları eksiksiz doldurunuz</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">İsim</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Adınız Soyadınız" 
                            {...field}
                            className="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500" 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ornek@email.com" 
                            {...field}
                            className="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500" 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Mesajınız</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Mesajınızı buraya yazın..." 
                            className="min-h-[150px] rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                      {success}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-orange-600 hover:bg-orange-700 transition-colors rounded-lg py-3 text-base font-medium"
                  >
                    Gönder
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}