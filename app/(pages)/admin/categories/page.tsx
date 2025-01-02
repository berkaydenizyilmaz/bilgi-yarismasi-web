"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/lib/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card } from "@/components/ui/card"
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
import { Edit, Plus, Trash2 } from "lucide-react"
import { Category } from "@/types/category";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const { toast } = useToast()

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

  // Kategori ekleme
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
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
        body: JSON.stringify({ name: editingCategory.name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Kategori güncellenemedi")
      }

      setCategories(categories.map(c => 
        c.id === editingCategory.id ? data.data : c
      ))
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

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Silme işlemi başarısız")
      }

      setCategories(categories.filter(c => c.id !== id))
      
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
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kategori Yönetimi</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Yeni Kategori
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Kategori Adı</TableHead>
              <TableHead>Soru Sayısı</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.questionCount}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category)
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
                          <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu kategoriyi silmek istediğinize emin misiniz?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category.id)}>
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

        {/* Kategori Ekleme Modalı */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Kategori Ekle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="categoryName">Kategori Adı</label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Kategori adını yazın..."
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Kategori Düzenleme Modalı */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kategori Düzenle</DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <form onSubmit={handleEditCategory} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="editCategoryName">Kategori Adı</label>
                  <Input
                    id="editCategoryName"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      name: e.target.value
                    })}
                    placeholder="Kategori adını yazın..."
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
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