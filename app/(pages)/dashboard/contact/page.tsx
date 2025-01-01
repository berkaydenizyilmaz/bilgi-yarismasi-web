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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Başlık */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-4"
          >
            İletişime Geçin
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600"
          >
            Sorularınız ve önerileriniz için bize ulaşın
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="grid md:grid-cols-5 gap-0">
            {/* Sol taraf */}
            <div className="hidden md:block md:col-span-2 bg-gradient-to-br from-orange-600 to-orange-500 p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6">Bizimle İletişime Geçin</h3>
                <p className="text-orange-100 mb-6 leading-relaxed">
                  Sorularınız veya önerileriniz için bize ulaşın. En kısa sürede size dönüş yapacağız.
                </p>
                <div className="mt-12">
                  <div className="flex items-center gap-3 text-orange-100 mb-4">
                    <Mail className="w-5 h-5" />
                    <span>yilmazberkaydeniz@gmail.com</span>
                  </div>
                </div>
              </div>
              {/* Dekoratif arka plan deseni */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full border-4 border-orange-200" />
                <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full border-4 border-orange-200" />
              </div>
            </div>

            {/* Sağ taraf - Form */}
            <div className="md:col-span-3 p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">İsim</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Adınız Soyadınız" 
                              {...field}
                              className="pl-10 rounded-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors" 
                            />
                            <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                        <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="ornek@email.com" 
                              {...field}
                              className="pl-10 rounded-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors" 
                            />
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                        <FormLabel className="text-gray-700 font-medium">Mesajınız</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea 
                              placeholder="Mesajınızı buraya yazın..." 
                              className="pl-10 min-h-[150px] rounded-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors" 
                              {...field} 
                            />
                            <MessageSquare className="w-5 h-5 text-gray-400 absolute left-3 top-4" />
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
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70"
                  >
                    {isSubmitting ? "Gönderiliyor..." : "Gönder"}
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