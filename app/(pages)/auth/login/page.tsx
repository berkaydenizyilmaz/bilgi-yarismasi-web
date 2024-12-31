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
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Form validasyon şeması
const formSchema = z.object({
  email: z.string().email({
    message: "Geçerli bir email adresi giriniz.",
  }),
  password: z.string().min(6, {
    message: "Şifre en az 6 karakter olmalıdır.",
  }),
})

export default function LoginPage() {
  const [error, setError] = useState<string>("")
  const { login, isLoading } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setError("")
      await login(values.email, values.password)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Giriş yapılırken bir hata oluştu")
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row overflow-hidden">
      {/* Sol Kısım - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-orange-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Giriş Yap</h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="ornek@email.com" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700 transition duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner className="w-5 h-5 mr-2" />
                    Giriş Yapılıyor...
                  </div>
                ) : (
                  "Giriş Yap"
                )}
              </Button>
              <p className="text-gray-600 mt-2 text-center text-sm md:text-base">
                Hesabınız yok mu?{" "}
                <Link href="/auth/register" className="text-orange-600 hover:underline">
                  Kayıt Ol
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>

      {/* Sağ Kısım - Görsel ve Bilgi */}
      <div className="hidden md:block md:w-1/2 p-8 text-white relative bg-gradient-to-l from-orange-600 to-orange-300">
        <div className="mb-8 mt-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">QuizVerse</h1>
          <h2 className="text-2xl md:text-3xl mt-12 font-semibold mb-4">Bilgi Yarışmalarına Katılın!</h2>
          <p className="mt-14 text-lg md:text-xl leading-relaxed">
            QuizVerse, bilgi yarışmalarına katılabileceğiniz ve kendinizi geliştirebileceğiniz bir platformdur. 
            Hızlı ve eğlenceli bir şekilde bilgi dağarcığınızı genişletmek için hemen giriş yapın!
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1/2">
          <img 
            src="/registerPage.png" 
            alt="QuizVerse" 
            className="h-full w-full object-cover opacity-85" 
          />
        </div>
      </div>
    </div>
  )
}