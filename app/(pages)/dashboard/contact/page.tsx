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
import { motion } from "framer-motion"
import { Mail, MessageSquare, User, CheckCircle, AlertCircle } from "lucide-react"

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
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      setIsSubmitting(true)
      setError("")
      setSuccess("")

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
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Başlık Bölümü */}
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent px-4">
              İletişime Geçin
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Sorularınız ve önerileriniz için bize ulaşın. Size en kısa sürede dönüş yapacağız.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
          <div className="grid md:grid-cols-5 gap-0">
            {/* Sol taraf */}
            <div className="hidden md:block md:col-span-2 bg-gradient-to-br from-orange-500 to-orange-600 p-12 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-8">Bizimle İletişime Geçin</h3>
                <p className="text-orange-50 mb-8 leading-relaxed text-lg">
                  Sorularınız veya önerileriniz için bize ulaşın. En kısa sürede size dönüş yapacağız.
                </p>
                <div className="mt-8">
                  <div className="flex items-center gap-3 text-orange-50">
                    <Mail className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-light break-words">
                      yilmazberkaydeniz@gmail.com
                    </span>
                  </div>
                </div>
              </div>
              {/* Dekoratif arka plan deseni */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full border-8 border-orange-200" />
                <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full border-8 border-orange-200" />
              </div>
            </div>

            {/* Sağ taraf - Form */}
            <div className="md:col-span-3 p-12">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold text-base">İsim</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input 
                              placeholder="Adınız Soyadınız" 
                              {...field}
                              className="pl-11 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all group-hover:border-orange-300" 
                            />
                            <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-hover:text-orange-500 transition-colors" />
                          </div>
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
                        <FormLabel className="text-gray-700 font-semibold text-base">Email</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input 
                              placeholder="ornek@email.com" 
                              {...field}
                              className="pl-11 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all group-hover:border-orange-300" 
                            />
                            <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-hover:text-orange-500 transition-colors" />
                          </div>
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
                        <FormLabel className="text-gray-700 font-semibold text-base">Mesajınız</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Textarea 
                              placeholder="Mesajınızı buraya yazın..." 
                              className="pl-11 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all group-hover:border-orange-300" 
                              {...field} 
                            />
                            <MessageSquare className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-hover:text-orange-500 transition-colors" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm"
                    >
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </motion.div>
                  )}

                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {success}
                    </motion.div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-70 text-lg relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <span className="animate-pulse">Gönderiliyor</span>
                          <span className="animate-bounce">...</span>
                        </>
                      ) : (
                        <>
                          Mesajı Gönder
                          <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}