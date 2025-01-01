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
import { motion } from "framer-motion"

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
    <div className="flex min-h-screen flex-col md:flex-row overflow-hidden">
      {/* Sol Kısım - Görsel ve Bilgi */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:block md:w-1/2 p-8 text-white relative bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400"
      >
        <div className="mb-8 mt-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-extrabold mb-2 text-white/90"
          >
            QuizVerse
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl mt-12 font-semibold mb-4 text-white/85"
          >
            Bilgi Yarışmalarına Katılın!
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-14 text-xl leading-relaxed text-white/80"
          >
            QuizVerse, bilgi yarışmalarına katılabileceğiniz ve kendinizi geliştirebileceğiniz bir platformdur. 
            Hızlı ve eğlenceli bir şekilde bilgi dağarcığınızı genişletmek için hemen kaydolun!
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-0 left-0 right-0 h-1/2"
        >
          <img 
            src="/registerPage.png" 
            alt="QuizVerse" 
            className="h-full w-full object-cover opacity-85 rounded-t-3xl" 
          />
        </motion.div>
      </motion.div>

      {/* Sağ Kısım - Form */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              Kayıt Ol
            </h1>
            <p className="text-gray-600 mt-2">QuizVerse'e katılmak için kaydolun!</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Kullanıcı Adı</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="kullaniciadi" 
                          {...field} 
                          className="w-full rounded-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
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
                          className="w-full rounded-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Şifre</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          className="w-full rounded-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Şifre Tekrar</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          className="w-full rounded-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white py-3 rounded-lg transition-all transform hover:scale-[1.02]"
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
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center text-gray-600 mt-4"
              >
                Zaten hesabınız var mı?{" "}
                <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors">
                  Giriş Yap
                </Link>
              </motion.p>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  )
}