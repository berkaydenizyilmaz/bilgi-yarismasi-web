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
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Kullanıcı adı en az 3 karakter olmalıdır.",
  }),
  email: z.string().email({
    message: "Geçerli bir email adresi giriniz.",
  }),
  password: z.string().min(6, {
    message: "Şifre en az 6 karakter olmalıdır.",
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor.",
  path: ["confirmPassword"],
})

export default function RegisterPage() {
  const [error, setError] = useState<string>("")
  const { register, isLoading } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setError("")
      await register(values.username, values.email, values.password)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Kayıt olurken bir hata oluştu")
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sol Kısım */}
      <div className="w-1/2 p-8 text-white relative flex flex-col justify-between bg-gradient-to-r from-orange-600 to-orange-300">
        {/* Sayfa Bilgileri */}
        <div className="mb-8 mt-8 text-center">
          <h1 className="text-5xl font-extrabold mb-2">QuizVerse</h1>
          <h2 className="text-3xl mt-12 font-semibold mb-4">Bilgi Yarışmalarına Katılın!</h2>
          <p className="mt-14 text-xl leading-relaxed">
            QuizVerse, bilgi yarışmalarına katılabileceğiniz ve kendinizi geliştirebileceğiniz bir platformdur. 
            Hızlı ve eğlenceli bir şekilde bilgi dağarcığınızı genişletmek için hemen kaydolun!
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1/2">
          <img src="/registerPage.png" alt="QuizVerse" className="h-full w-full object-cover opacity-85" />
        </div>
      </div>

      {/* Sağ Kısım */}
      <div className="w-1/2 flex items-center justify-center bg-orange-50">
        <div className="w-full max-w-md p-6 shadow-lg rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Kayıt Ol</h2>
            <p className="text-gray-600 mt-2">QuizVerse'e katılmak için kaydolun!</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanıcı Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="kullaniciadi" {...field} className="border-2 border-gray-300 rounded-md p-2" />
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
                      <Input placeholder="ornek@email.com" {...field} className="border-2 border-gray-300 rounded-md p-2" />
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
                      <Input type="password" {...field} className="border-2 border-gray-300 rounded-md p-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre Tekrar</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} className="border-2 border-gray-300 rounded-md p-2" />
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
                    Kayıt Yapılıyor...
                  </div>
                ) : (
                  "Kayıt Ol"
                )}
              </Button>
            </form>
          </Form>
          <p className="text-center mt-4">
            Zaten hesabınız var mı?{" "}
            <Link href="/auth/login" className="text-orange-600 hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}