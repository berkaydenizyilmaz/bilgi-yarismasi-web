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
import { ChevronLeft, ChevronRight, Edit, Plus, Search, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Question {
  id: number
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: string
  categoryId: number
  categoryName: string
}

// Form validasyonu için bir interface ekleyelim
interface FormErrors {
  questionText?: string
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  correctOption?: string
  categoryId?: string
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [categories, setCategories] = useState<{id: number, name: string}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const { toast } = useToast()
  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A",
    categoryId: 1
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Validasyon fonksiyonu ekleyelim
  const validateForm = (question: typeof newQuestion): FormErrors => {
    const errors: FormErrors = {}
    
    if (!question.questionText.trim()) {
      errors.questionText = "Soru metni boş bırakılamaz"
    } else if (question.questionText.length < 10) {
      errors.questionText = "Soru metni en az 10 karakter olmalıdır"
    }

    if (!question.optionA.trim()) errors.optionA = "A şıkkı boş bırakılamaz"
    if (!question.optionB.trim()) errors.optionB = "B şıkkı boş bırakılamaz"
    if (!question.optionC.trim()) errors.optionC = "C şıkkı boş bırakılamaz"
    if (!question.optionD.trim()) errors.optionD = "D şıkkı boş bırakılamaz"
    
    if (!question.correctOption) errors.correctOption = "Doğru cevap seçilmelidir"
    if (!question.categoryId) errors.categoryId = "Kategori seçilmelidir"

    return errors
  }

  // Soruları ve kategorileri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/questions?page=${page}&search=${searchTerm}&category=${selectedCategory}`),
          fetch('/api/admin/categories')
        ])
        
        const questionsData = await questionsRes.json()
        const categoriesData = await categoriesRes.json()

        if (questionsData.success) {
          setQuestions(questionsData.data.questions)
          setTotalPages(questionsData.data.totalPages)
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data)
        }

        console.log('Kategoriler:', categoriesData)
      } catch (error) {
        toast({
          title: "Hata",
          description: "Veriler yüklenirken bir hata oluştu",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [page, searchTerm, selectedCategory])

  // Soru silme işlemi
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Silme işlemi başarısız');
      }

      // Başarılı silme işleminden sonra listeyi güncelle
      setQuestions(questions.filter(q => q.id !== id));
      
      toast({
        title: "Başarılı",
        description: "Soru başarıyla silindi",
      });
    } catch (error) {
      console.error('Silme hatası:', error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Soru silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm(newQuestion)
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
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion),
      })

      if (!response.ok) throw new Error('Soru eklenemedi')

      // Soruları yeniden yükle
      const updatedQuestionsRes = await fetch(`/api/admin/questions?page=${page}&search=${searchTerm}&category=${selectedCategory}`)
      const updatedQuestionsData = await updatedQuestionsRes.json()

      if (updatedQuestionsData.success) {
        setQuestions(updatedQuestionsData.data.questions)
        setTotalPages(updatedQuestionsData.data.totalPages)
      }

      setIsAddModalOpen(false)
      setNewQuestion({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "A",
        categoryId: 1
      })
      
      toast({
        title: "Başarılı",
        description: "Soru başarıyla eklendi"
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Soru eklenirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const handleEditQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    // Form validasyonunu kontrol et
    const errors = validateForm({
      questionText: editingQuestion.questionText,
      optionA: editingQuestion.optionA,
      optionB: editingQuestion.optionB,
      optionC: editingQuestion.optionC,
      optionD: editingQuestion.optionD,
      correctOption: editingQuestion.correctOption,
      categoryId: editingQuestion.categoryId
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doğru şekilde doldurun",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionText: editingQuestion.questionText,
          optionA: editingQuestion.optionA,
          optionB: editingQuestion.optionB,
          optionC: editingQuestion.optionC,
          optionD: editingQuestion.optionD,
          correctOption: editingQuestion.correctOption,
          categoryId: editingQuestion.categoryId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Güncelleme işlemi başarısız');
      }

      const result = await response.json();

      // Başarılı güncelleme işleminden sonra listeyi güncelle
      setQuestions(questions.map(q => 
        q.id === editingQuestion.id ? result.data : q
      ));
      
      setIsEditModalOpen(false);
      setEditingQuestion(null);
      
      toast({
        title: "Başarılı",
        description: "Soru başarıyla güncellendi",
      });
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Soru güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]">
      <LoadingSpinner className="h-8 w-8" />
    </div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Soru Yönetimi</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Yeni Soru
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <Input
              placeholder="Soru ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Kategori seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="loading" disabled>
                  Kategori bulunamadı
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Soru</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>{question.id}</TableCell>
                <TableCell>{question.questionText}</TableCell>
                <TableCell>{question.categoryName}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingQuestion(question)
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
                          <AlertDialogTitle>Soruyu Sil</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu soruyu silmek istediğinize emin misiniz?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(question.id)}>
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

        {/* Sayfalama */}
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
      </Card>

      {/* Soru Ekleme Modalı */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Soru Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="questionText">Soru</label>
              <Textarea
                id="questionText"
                value={newQuestion.questionText}
                onChange={(e) => {
                  setNewQuestion({ ...newQuestion, questionText: e.target.value })
                  setFormErrors({ ...formErrors, questionText: undefined })
                }}
                placeholder="Soruyu yazın..."
                className={`min-h-[100px] ${formErrors.questionText ? 'border-red-500' : ''}`}
              />
              {formErrors.questionText && (
                <p className="text-sm text-red-500">{formErrors.questionText}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="optionA">A Şıkkı</label>
                <Input
                  id="optionA"
                  value={newQuestion.optionA}
                  onChange={(e) => {
                    setNewQuestion({ ...newQuestion, optionA: e.target.value })
                    setFormErrors({ ...formErrors, optionA: undefined })
                  }}
                  className={formErrors.optionA ? 'border-red-500' : ''}
                />
                {formErrors.optionA && (
                  <p className="text-sm text-red-500">{formErrors.optionA}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="optionB">B Şıkkı</label>
                <Input
                  id="optionB"
                  value={newQuestion.optionB}
                  onChange={(e) => {
                    setNewQuestion({ ...newQuestion, optionB: e.target.value })
                    setFormErrors({ ...formErrors, optionB: undefined })
                  }}
                  className={formErrors.optionB ? 'border-red-500' : ''}
                />
                {formErrors.optionB && (
                  <p className="text-sm text-red-500">{formErrors.optionB}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="optionC">C Şıkkı</label>
                <Input
                  id="optionC"
                  value={newQuestion.optionC}
                  onChange={(e) => {
                    setNewQuestion({ ...newQuestion, optionC: e.target.value })
                    setFormErrors({ ...formErrors, optionC: undefined })
                  }}
                  className={formErrors.optionC ? 'border-red-500' : ''}
                />
                {formErrors.optionC && (
                  <p className="text-sm text-red-500">{formErrors.optionC}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="optionD">D Şıkkı</label>
                <Input
                  id="optionD"
                  value={newQuestion.optionD}
                  onChange={(e) => {
                    setNewQuestion({ ...newQuestion, optionD: e.target.value })
                    setFormErrors({ ...formErrors, optionD: undefined })
                  }}
                  className={formErrors.optionD ? 'border-red-500' : ''}
                />
                {formErrors.optionD && (
                  <p className="text-sm text-red-500">{formErrors.optionD}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="correctOption">Doğru Cevap</label>
              <Select
                value={newQuestion.correctOption}
                onValueChange={(value) => {
                  setNewQuestion({ ...newQuestion, correctOption: value })
                  setFormErrors({ ...formErrors, correctOption: undefined })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Doğru cevabı seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.correctOption && (
                <p className="text-sm text-red-500">{formErrors.correctOption}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="categoryId">Kategori</label>
              <Select
                value={newQuestion.categoryId.toString()}
                onValueChange={(value) => {
                  setNewQuestion({ ...newQuestion, categoryId: parseInt(value) })
                  setFormErrors({ ...formErrors, categoryId: undefined })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.categoryId && (
                <p className="text-sm text-red-500">{formErrors.categoryId}</p>
              )}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                İptal
              </Button>
              <Button type="submit">Kaydet</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Soru Düzenleme Modalı */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open);
        if (!open) setFormErrors({}); // Modal kapandığında hataları temizle
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Soru Düzenle</DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <form onSubmit={handleEditQuestion} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-questionText">Soru</label>
                <Textarea
                  id="edit-questionText"
                  value={editingQuestion.questionText}
                  onChange={(e) => {
                    setEditingQuestion({ ...editingQuestion, questionText: e.target.value });
                    setFormErrors({ ...formErrors, questionText: undefined });
                  }}
                  placeholder="Soruyu yazın..."
                  className={`min-h-[100px] ${formErrors.questionText ? 'border-red-500' : ''}`}
                />
                {formErrors.questionText && (
                  <p className="text-sm text-red-500">{formErrors.questionText}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-optionA">A Şıkkı</label>
                  <Input
                    id="edit-optionA"
                    value={editingQuestion.optionA}
                    onChange={(e) => {
                      setEditingQuestion({ ...editingQuestion, optionA: e.target.value });
                      setFormErrors({ ...formErrors, optionA: undefined });
                    }}
                    className={formErrors.optionA ? 'border-red-500' : ''}
                  />
                  {formErrors.optionA && (
                    <p className="text-sm text-red-500">{formErrors.optionA}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-optionB">B Şıkkı</label>
                  <Input
                    id="edit-optionB"
                    value={editingQuestion.optionB}
                    onChange={(e) => {
                      setEditingQuestion({ ...editingQuestion, optionB: e.target.value });
                      setFormErrors({ ...formErrors, optionB: undefined });
                    }}
                    className={formErrors.optionB ? 'border-red-500' : ''}
                  />
                  {formErrors.optionB && (
                    <p className="text-sm text-red-500">{formErrors.optionB}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-optionC">C Şıkkı</label>
                  <Input
                    id="edit-optionC"
                    value={editingQuestion.optionC}
                    onChange={(e) => {
                      setEditingQuestion({ ...editingQuestion, optionC: e.target.value });
                      setFormErrors({ ...formErrors, optionC: undefined });
                    }}
                    className={formErrors.optionC ? 'border-red-500' : ''}
                  />
                  {formErrors.optionC && (
                    <p className="text-sm text-red-500">{formErrors.optionC}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-optionD">D Şıkkı</label>
                  <Input
                    id="edit-optionD"
                    value={editingQuestion.optionD}
                    onChange={(e) => {
                      setEditingQuestion({ ...editingQuestion, optionD: e.target.value });
                      setFormErrors({ ...formErrors, optionD: undefined });
                    }}
                    className={formErrors.optionD ? 'border-red-500' : ''}
                  />
                  {formErrors.optionD && (
                    <p className="text-sm text-red-500">{formErrors.optionD}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-correctOption">Doğru Cevap</label>
                <Select
                  value={editingQuestion.correctOption}
                  onValueChange={(value) => {
                    setEditingQuestion({ ...editingQuestion, correctOption: value });
                    setFormErrors({ ...formErrors, correctOption: undefined });
                  }}
                >
                  <SelectTrigger className={formErrors.correctOption ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Doğru cevabı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.correctOption && (
                  <p className="text-sm text-red-500">{formErrors.correctOption}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-categoryId">Kategori</label>
                <Select
                  value={editingQuestion.categoryId.toString()}
                  onValueChange={(value) => {
                    setEditingQuestion({ ...editingQuestion, categoryId: parseInt(value) });
                    setFormErrors({ ...formErrors, categoryId: undefined });
                  }}
                >
                  <SelectTrigger className={formErrors.categoryId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.categoryId && (
                  <p className="text-sm text-red-500">{formErrors.categoryId}</p>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setFormErrors({});
                  }}
                >
                  İptal
                </Button>
                <Button type="submit">Güncelle</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}