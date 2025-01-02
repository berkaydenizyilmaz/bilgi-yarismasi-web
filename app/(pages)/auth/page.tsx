"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Brain, ArrowRight, ArrowLeft, CheckCircle2, Mail, Lock, User, UserPlus, LogIn } from "lucide-react"

// Form şemaları
const loginSchema = z.object({
  email: z.string().email({
    message: "Geçerli bir email adresi giriniz.",
  }),
  password: z.string().min(6, {
    message: "Şifre en az 6 karakter olmalıdır.",
  }),
})

const registerSchema = z.object({
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

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string>("")
  const { login, register, isLoading } = useAuth()

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    try {
      setError("")
      await login(values.email, values.password)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Giriş yapılırken bir hata oluştu")
    }
  }

  async function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    try {
      setError("")
      await register(values.username, values.email, values.password)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Kayıt olurken bir hata oluştu")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-gray-900 p-4 relative overflow-hidden">
      {/* Yeni arka plan desenleri */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      <div className="absolute top-20 -left-6 w-72 h-72 bg-rose-200/40 dark:bg-rose-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-40 -right-6 w-72 h-72 bg-amber-200/40 dark:bg-amber-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-200/40 dark:bg-orange-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      
      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          {/* Bilgi Kısmı */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md lg:w-1/2 text-center lg:text-left px-4"
          >
            <motion.div
              className="inline-block p-6 bg-gradient-to-br from-rose-500 to-orange-500 rounded-3xl mb-6 shadow-xl"
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              whileTap={{ scale: 0.95 }}
            >
              <Brain className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                QuizVerse'e
              </span>
              <br />
              Hoş Geldiniz
            </h1>
            <div className="space-y-4 text-gray-600">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg"
              >
                Bilgi yolculuğunuza başlamak için hazır mısınız?
              </motion.p>
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  <span>Binlerce quiz ile kendini test et</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  <span>Kendi quizlerini oluştur ve paylaş</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-500" />
                  <span>Arkadaşlarınla yarış ve öğren</span>
                </li>
              </motion.ul>
            </div>
          </motion.div>

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md lg:w-1/2"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-rose-500/5 to-transparent dark:from-rose-400/10 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-amber-500/5 to-transparent dark:from-amber-400/10 rounded-full blur-3xl -z-10" />

              <div className="perspective-1000">
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.div
                      key="login"
                      initial={{ 
                        opacity: 0,
                        x: -100,
                        scale: 0.95
                      }}
                      animate={{ 
                        opacity: 1,
                        x: 0,
                        scale: 1
                      }}
                      exit={{ 
                        opacity: 0,
                        x: 100,
                        scale: 0.95
                      }}
                      transition={{ 
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    >
                      <h2 className="text-2xl font-semibold bg-gradient-to-r from-rose-600 to-orange-400 bg-clip-text text-transparent mb-6">
                        Giriş Yap
                      </h2>
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Email
                                </FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <Input 
                                      {...field} 
                                      placeholder="ornek@email.com"
                                      className="h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 
                                      bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm 
                                      focus:border-orange-300 dark:focus:border-orange-500 
                                      focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/30 
                                      transition-all duration-300 pl-10
                                      placeholder:text-gray-400 dark:placeholder:text-gray-500" 
                                    />
                                    <Mail className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500 
                                      group-focus-within:text-orange-500 transition-colors duration-300" />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Şifre
                                </FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <Input 
                                      type="password" 
                                      {...field} 
                                      placeholder="••••••••"
                                      className="h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 
                                      bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm 
                                      focus:border-orange-300 dark:focus:border-orange-500 
                                      focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/30 
                                      transition-all duration-300 pl-10
                                      placeholder:text-gray-400 dark:placeholder:text-gray-500" 
                                    />
                                    <Lock className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500 
                                      group-focus-within:text-orange-500 transition-colors duration-300" />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full h-12 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 
                            hover:from-rose-600 hover:via-orange-600 hover:to-amber-600 
                            text-white font-medium rounded-xl 
                            shadow-lg shadow-orange-500/20 dark:shadow-orange-500/10 
                            transition-all duration-300 
                            hover:shadow-xl hover:shadow-orange-500/30 dark:hover:shadow-orange-500/20 
                            hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed
                            disabled:hover:scale-100"
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <LoadingSpinner className="w-5 h-5" />
                                <span>{isLogin ? "Giriş yapılıyor..." : "Kayıt olunuyor..."}</span>
                              </div>
                            ) : (
                              <span className="flex items-center gap-2 justify-center">
                                {isLogin ? (
                                  <>
                                    <LogIn className="w-5 h-5" />
                                    Giriş Yap
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="w-5 h-5" />
                                    Kayıt Ol
                                  </>
                                )}
                              </span>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register"
                      initial={{ 
                        opacity: 0,
                        x: 100,
                        scale: 0.95
                      }}
                      animate={{ 
                        opacity: 1,
                        x: 0,
                        scale: 1
                      }}
                      exit={{ 
                        opacity: 0,
                        x: -100,
                        scale: 0.95
                      }}
                      transition={{ 
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    >
                      <h2 className="text-2xl font-semibold bg-gradient-to-r from-rose-600 to-orange-400 bg-clip-text text-transparent mb-6">
                        Kayıt Ol
                      </h2>
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Kullanıcı Adı
                                </FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <Input 
                                      {...field} 
                                      placeholder="kullaniciadi"
                                      className="h-12 px-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 
                                      bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm 
                                      focus:border-orange-300 dark:focus:border-orange-500 
                                      focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/30 
                                      transition-all duration-300 pl-10
                                      placeholder:text-gray-400 dark:placeholder:text-gray-500" 
                                    />
                                    <User className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 dark:text-gray-500 
                                      group-focus-within:text-orange-500 transition-colors duration-300" />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="ornek@email.com" 
                                    {...field} 
                                    className="h-12 rounded-xl" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Şifre</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    {...field} 
                                    className="h-12 rounded-xl" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Şifre Tekrar</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    {...field} 
                                    className="h-12 rounded-xl" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full h-12 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:via-orange-600 hover:to-amber-600 text-white rounded-xl shadow-lg shadow-orange-500/20 dark:shadow-orange-500/10 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 dark:hover:shadow-orange-500/20 hover:scale-[1.02]"
                          >
                            {isLoading ? <LoadingSpinner className="w-5 h-5" /> : "Kayıt Ol"}
                          </Button>
                        </form>
                      </Form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm text-red-600 dark:text-red-400 rounded-2xl text-sm text-center border border-red-100 dark:border-red-800"
                >
                  {error}
                </motion.div>
              )}

              {/* Geçiş Butonu */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-center"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setError("");
                    setIsLogin(!isLogin);
                    
                    if (isLogin) {
                      registerForm.reset();
                    } else {
                      loginForm.reset();
                    }
                  }}
                  className="relative overflow-hidden group text-rose-600 hover:text-orange-700 transition-all duration-500"
                >
                  {isLogin ? (
                    <motion.div 
                      className="flex items-center gap-2"
                      whileHover={{
                        x: 5,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 10
                        }
                      }}
                    >
                      <span>Hesabınız yok mu?</span>
                      <span className="flex items-center gap-1">
                        Kayıt Ol <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="flex items-center gap-2"
                      whileHover={{
                        x: -5,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 10
                        }
                      }}
                    >
                      <span className="flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
                        Giriş Yap
                      </span>
                      <span>hesabınız var mı?</span>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}