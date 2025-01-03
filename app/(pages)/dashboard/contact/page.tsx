"use client"

import React, { useState } from "react"
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
import { motion } from "framer-motion"
import { Mail, MessageSquare, User, CheckCircle, AlertCircle } from "lucide-react"

// Tip tanımlamaları
interface FormInputProps {
  label: string
  placeholder: string
  icon: React.ReactNode
  field: any
  isTextarea?: boolean
}

interface StatusMessagesProps {
  error: string
  success: string
}

interface SubmitButtonProps {
  isSubmitting: boolean
}

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

// Tip çıkarımı için form değerleri tipi
type FormValues = z.infer<typeof formSchema>

// Animasyon varyantları
const animations = {
  pageInitial: { opacity: 0, y: 20 },
  pageAnimate: { opacity: 1, y: 0 },
  pageTransition: { duration: 0.5 },
  messageInitial: { opacity: 0, y: 10 },
  messageAnimate: { opacity: 1, y: 0 }
}

// Stil sabitleri
const inputClassName = "pl-11 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all group-hover:border-orange-300"

export default function ContactPage() {
  // State yönetimi
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form hook'u
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  // Form gönderme işleyicisi
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      setError("")
      setSuccess("")

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        initial={animations.pageInitial}
        animate={animations.pageAnimate}
        transition={animations.pageTransition} 
        className="max-w-4xl mx-auto"
      >
        <PageHeader />
        <ContactCard 
          form={form} 
          onSubmit={onSubmit}
          error={error}
          success={success}
          isSubmitting={isSubmitting}
        />
      </motion.div>
    </div>
  )
}

// Alt Bileşenler
function PageHeader() {
  return (
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
  )
}

interface ContactCardProps {
  form: any
  onSubmit: (values: FormValues) => Promise<void>
  error: string
  success: string
  isSubmitting: boolean
}

function ContactCard({ form, onSubmit, error, success, isSubmitting }: ContactCardProps) {
  return (
    <motion.div 
      initial={animations.pageInitial}
      animate={animations.pageAnimate}
      transition={{ delay: 0.3 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
    >
      <div className="grid md:grid-cols-5 gap-0">
        <InfoPanel />
        <FormPanel 
          form={form}
          onSubmit={onSubmit}
          error={error}
          success={success}
          isSubmitting={isSubmitting}
        />
      </div>
    </motion.div>
  )
}

function InfoPanel() {
  return (
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
      <BackgroundPattern />
    </div>
  )
}

function BackgroundPattern() {
  return (
    <div className="absolute inset-0 opacity-10">
      <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full border-8 border-orange-200" />
      <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full border-8 border-orange-200" />
    </div>
  )
}

interface FormPanelProps extends ContactCardProps {}

function FormPanel({ form, onSubmit, error, success, isSubmitting }: FormPanelProps) {
  return (
    <div className="md:col-span-3 p-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormInput
                label="İsim"
                placeholder="Adınız Soyadınız"
                icon={<User />}
                field={field}
              />
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormInput
                label="Email"
                placeholder="ornek@email.com"
                icon={<Mail />}
                field={field}
              />
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormInput
                label="Mesajınız"
                placeholder="Mesajınızı buraya yazın..."
                icon={<MessageSquare />}
                field={field}
                isTextarea
              />
            )}
          />

          <StatusMessages error={error} success={success} />
          <SubmitButton isSubmitting={isSubmitting} />
        </form>
      </Form>
    </div>
  )
}

function FormInput({ label, placeholder, icon, field, isTextarea = false }: FormInputProps) {
  const InputComponent = isTextarea ? Textarea : Input

  return (
    <FormItem>
      <FormLabel className="text-gray-700 font-semibold text-base">{label}</FormLabel>
      <FormControl>
        <div className="relative group">
          <InputComponent 
            placeholder={placeholder}
            {...field}
            className={inputClassName}
          />
          {React.cloneElement(icon as React.ReactElement, {
            className: "w-5 h-5 text-gray-400 absolute left-4 top-3.5 group-hover:text-orange-500 transition-colors"
          })}
        </div>
      </FormControl>
      <FormMessage className="text-red-500" />
    </FormItem>
  )
}

function StatusMessages({ error, success }: StatusMessagesProps) {
  return (
    <>
      {error && (
        <motion.div 
          initial={animations.messageInitial}
          animate={animations.messageAnimate}
          className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm"
        >
          <AlertCircle className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={animations.messageInitial}
          animate={animations.messageAnimate}
          className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm"
        >
          <CheckCircle className="w-5 h-5" />
          {success}
        </motion.div>
      )}
    </>
  )
}

function SubmitButton({ isSubmitting }: SubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      disabled={isSubmitting}
      className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 
        text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] 
        hover:shadow-xl disabled:opacity-70 text-lg relative overflow-hidden group"
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
  )
}