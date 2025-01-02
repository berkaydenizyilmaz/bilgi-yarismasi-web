"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/lib/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Input } from "@/components/ui/input"
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
import { Edit, Plus, Trash2, Save, FolderPlus, Folder, AlertCircle } from "lucide-react"
import { Category } from "@/types/category"
import { motion } from "framer-motion"

// Form validasyonu için interface
interface FormErrors {
  name?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const { toast } = useToast()
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Kategorileri yükle
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories')
        const data = await response.json()

        if (data.success) {
          setCategories(data.data)
        } else {
          throw new Error(data.error?.message || "Kategoriler yüklenemedi")
        }
      } catch (error) {
        toast({
          title: "Hata",
          description: "Kategoriler yüklenirken bir hata oluştu",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Validasyon fonksiyonu
  const validateForm = (name: string): FormErrors => {
    const errors: FormErrors = {}
    
    if (!name.trim()) {
      errors.name = "Kategori adı boş bırakılamaz"
    } else if (name.length < 2) {
      errors.name = "Kategori adı en az 2 karakter olmalıdır"
    }

    return errors
  }

  // Kategori ekleme
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Form validasyonunu kontrol et
    const errors = validateForm(newCategoryName)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      toast({
        title: "Hata",
        description: "Lütfen kategori adını doğru şekilde girin",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Kategori eklenemedi")
      }

      // Kategorileri yeniden yükle
      const updatedCategoriesRes = await fetch('/api/admin/categories')
      const updatedCategoriesData = await updatedCategoriesRes.json()
      
      if (updatedCategoriesData.success) {
        setCategories(updatedCategoriesData.data)
      }

      setIsAddModalOpen(false)
      setNewCategoryName("")
      
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla eklendi"
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Kategori eklenirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  // Kategori güncelleme
  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: editingCategory.name
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Kategori güncellenemedi")
      }

      // Kategorileri yeniden yükle
      const updatedCategoriesRes = await fetch('/api/admin/categories')
      const updatedCategoriesData = await updatedCategoriesRes.json()
      
      if (updatedCategoriesData.success) {
        setCategories(updatedCategoriesData.data)
      }

      setIsEditModalOpen(false)
      setEditingCategory(null)
      
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla güncellendi"
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Kategori güncellenirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  // Kategori silme
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Silme işlemi başarısız")
      }

      // Kategorileri yeniden yükle
      const updatedCategoriesRes = await fetch('/api/admin/categories')
      const updatedCategoriesData = await updatedCategoriesRes.json()
      
      if (updatedCategoriesData.success) {
        setCategories(updatedCategoriesData.data)
      }
      
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla silindi"
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Kategori silinirken bir hata oluştu",
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
              Kategori Yönetimi
            </h1>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-medium transition-all duration-300"
            >
              <FolderPlus className="h-4 w-4 mr-2" /> Yeni Kategori
            </Button>
          </div>

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Kategori Adı</TableHead>
                  <TableHead className="font-semibold">Soru Sayısı</TableHead>
                  <TableHead className="font-semibold">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-orange-50/50 transition-colors">
                    <TableCell className="font-medium">{category.id}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        {category.questionCount} Soru
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(category)
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
                              <AlertDialogTitle className="text-xl font-bold">Kategoriyi Sil</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                Bu kategoriyi silmek istediğinize emin misiniz?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="hover:bg-gray-100">İptal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(category.id)}
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
        </motion.div>

        {/* Kategori Ekleme Modalı */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-md border-0 rounded-[32px] shadow-2xl max-w-xl w-full p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 relative overflow-hidden">
              <DialogTitle className="text-2xl font-bold text-white m-0 relative z-10">
                Yeni Kategori Ekle
              </DialogTitle>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full border-4 border-white" />
                <div className="absolute -left-8 -top-8 w-32 h-32 rounded-full border-4 border-white" />
              </div>
            </div>
            <form onSubmit={handleAddCategory} className="p-8 space-y-6">
              <div className="space-y-2">
                <label htmlFor="categoryName" className="text-gray-700 font-medium flex items-center gap-2">
                  <Folder className="w-4 h-4 text-orange-500" />
                  Kategori Adı
                </label>
                <div className="relative">
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => {
                      setNewCategoryName(e.target.value)
                      setFormErrors({})
                    }}
                    className={`h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all duration-200
                      ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-orange-500 focus:ring-orange-500'}`}
                    placeholder="Kategori adını yazın..."
                  />
                </div>
                {formErrors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddModalOpen(false)
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
          </DialogContent>
        </Dialog>

        {/* Kategori Düzenleme Modalı */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-md border-0 rounded-[32px] shadow-2xl max-w-xl w-full p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 relative overflow-hidden">
              <DialogTitle className="text-2xl font-bold text-white m-0 relative z-10">
                Kategori Düzenle
              </DialogTitle>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full border-4 border-white" />
                <div className="absolute -left-8 -top-8 w-32 h-32 rounded-full border-4 border-white" />
              </div>
            </div>
            {editingCategory && (
              <form onSubmit={handleEditCategory} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="editCategoryName" className="text-gray-700 font-medium flex items-center gap-2">
                    <Folder className="w-4 h-4 text-orange-500" />
                    Kategori Adı
                  </label>
                  <div className="relative">
                    <Input
                      id="editCategoryName"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({
                        ...editingCategory,
                        name: e.target.value
                      })}
                      className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                      placeholder="Kategori adını yazın..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="h-12 px-6 rounded-2xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    İptal
                  </Button>
                  <Button 
                    type="submit"
                    className="h-12 px-6 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Güncelle
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