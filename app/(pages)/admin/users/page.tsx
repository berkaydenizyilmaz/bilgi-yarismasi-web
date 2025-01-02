"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/lib/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, ChevronLeft, ChevronRight, User, Mail, AlertCircle, Shield, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"


// Form validasyonu için interface
interface FormErrors {
  username?: string
  email?: string
  role?: string
}

interface User {
  id: number
  username: string
  email: string
  role: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 15
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/admin/users?page=${page}&pageSize=${pageSize}`)
        const data = await response.json()

        if (data.success) {
          setUsers(data.data.users)
          setTotalPages(Math.ceil(data.data.total / pageSize))
        } else {
          throw new Error(data.error?.message || "Kullanıcılar yüklenemedi")
        }
      } catch (error) {
        toast({
          title: "Hata",
          description: "Kullanıcılar yüklenirken bir hata oluştu",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [page])

  // Validasyon fonksiyonu
  const validateForm = (user: User): FormErrors => {
    const errors: FormErrors = {}
    
    if (!user.username.trim()) {
      errors.username = "Kullanıcı adı boş bırakılamaz"
    } else if (user.username.length < 3) {
      errors.username = "Kullanıcı adı en az 3 karakter olmalıdır"
    }

    if (!user.email.trim()) {
      errors.email = "E-posta adresi boş bırakılamaz"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      errors.email = "Geçerli bir e-posta adresi giriniz"
    }

    if (!user.role) {
      errors.role = "Rol seçilmelidir"
    }

    return errors
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    // Form validasyonunu kontrol et
    const errors = validateForm(editingUser)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doğru şekilde doldurun",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch(`/api/admin/users?id=${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingUser),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Kullanıcı güncellenemedi")
      }

      setUsers(users.map(u => 
        u.id === editingUser.id ? data.data.user : u
      ))
      setIsEditModalOpen(false)
      setEditingUser(null)
      
      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla güncellendi"
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Kullanıcı güncellenirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Silme işlemi başarısız")
      }

      setUsers(users.filter(u => u.id !== id))
      
      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla silindi"
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Kullanıcı silinirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8 px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-8"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              Kullanıcı Yönetimi
            </h1>
          </div>

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Kullanıcı Adı</TableHead>
                  <TableHead className="font-semibold">E-posta</TableHead>
                  <TableHead className="font-semibold">Rol</TableHead>
                  <TableHead className="font-semibold">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-orange-50/50 transition-colors">
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user)
                            setIsEditModalOpen(true)
                          }}
                          className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="hover:bg-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white/80 backdrop-blur-sm border-0">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-bold">Kullanıcıyı Sil</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                Bu kullanıcıyı silmek istediğinize emin misiniz?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="hover:bg-gray-100">İptal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(user.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Önceki
              </Button>
              <span className="text-gray-600 font-medium">
                Sayfa {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
              >
                Sonraki <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </motion.div>

        {/* Düzenleme Modal'ı */}
        <Dialog open={isEditModalOpen} onOpenChange={(open) => {
          setIsEditModalOpen(open)
          if (!open) {
            setFormErrors({})
          }
        }}>
          <DialogContent className="bg-white/95 backdrop-blur-md border-0 rounded-[32px] shadow-2xl max-w-xl w-full p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 relative overflow-hidden">
              <DialogTitle className="text-2xl font-bold text-white m-0 relative z-10">
                Kullanıcı Düzenle
              </DialogTitle>
              {/* Dekoratif arka plan deseni */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full border-4 border-white" />
                <div className="absolute -left-8 -top-8 w-32 h-32 rounded-full border-4 border-white" />
              </div>
            </div>
            {editingUser && (
              <form onSubmit={handleEditUser} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="editUsername" className="text-gray-700 font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />
                    Kullanıcı Adı
                  </label>
                  <div className="relative">
                    <Input
                      id="editUsername"
                      value={editingUser.username}
                      onChange={(e) => {
                        setEditingUser({
                          ...editingUser,
                          username: e.target.value
                        })
                        setFormErrors({ ...formErrors, username: undefined })
                      }}
                      className={`h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all duration-200
                        ${formErrors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-orange-500 focus:ring-orange-500'}`}
                      placeholder="Kullanıcı adını girin"
                    />
                  </div>
                  {formErrors.username && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="editEmail" className="text-gray-700 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-500" />
                    E-posta
                  </label>
                  <div className="relative">
                    <Input
                      id="editEmail"
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => {
                        setEditingUser({
                          ...editingUser,
                          email: e.target.value
                        })
                        setFormErrors({ ...formErrors, email: undefined })
                      }}
                      className={`h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all duration-200
                        ${formErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-orange-500 focus:ring-orange-500'}`}
                      placeholder="E-posta adresini girin"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="editRole" className="text-gray-700 font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-500" />
                    Rol
                  </label>
                  <select
                    id="editRole"
                    value={editingUser.role}
                    onChange={(e) => {
                      setEditingUser({
                        ...editingUser,
                        role: e.target.value
                      })
                      setFormErrors({ ...formErrors, role: undefined })
                    }}
                    className={`w-full h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white px-4 transition-all duration-200
                      ${formErrors.role ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-orange-500 focus:ring-orange-500'}`}
                  >
                    <option value="">Rol Seçin</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  {formErrors.role && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.role}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditModalOpen(false)
                      setFormErrors({})
                    }}
                    className="h-12 px-6 rounded-2xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    İptal
                  </Button>
                  <Button 
                    type="submit"
                    className="h-12 px-6 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}