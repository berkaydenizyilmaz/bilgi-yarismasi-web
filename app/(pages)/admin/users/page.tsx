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
import { Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"

interface User {
  id: number
  email: string
  username: string
  role: string
}

// Form validasyonu için interface
interface FormErrors {
  username?: string
  email?: string
  role?: string
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
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Kullanıcı Adı</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
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
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu kullanıcıyı silmek istediğinize emin misiniz?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user.id)}>
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

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Önceki
            </Button>
            <span>
              Sayfa {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sonraki <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Kullanıcı Düzenleme Modalı */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kullanıcı Düzenle</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={handleEditUser} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="editUsername">Kullanıcı Adı</label>
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
                    className={formErrors.username ? 'border-red-500' : ''}
                  />
                  {formErrors.username && (
                    <p className="text-sm text-red-500">{formErrors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="editEmail">E-posta</label>
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
                    className={formErrors.email ? 'border-red-500' : ''}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="editRole">Rol</label>
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
                    className={`w-full rounded-md border border-input bg-background px-3 py-2 ${
                      formErrors.role ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Rol Seçin</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  {formErrors.role && (
                    <p className="text-sm text-red-500">{formErrors.role}</p>
                  )}
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsEditModalOpen(false)
                    setFormErrors({})
                  }}>
                    İptal
                  </Button>
                  <Button type="submit">Güncelle</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}