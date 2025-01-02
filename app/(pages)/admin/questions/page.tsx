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
import { Question } from "@/types/quiz";
import { motion } from "framer-motion"


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
          // Doğru cevapları büyük harfe çevir
          const formattedQuestions = questionsData.data.questions.map((q:any) => ({
            ...q,
            correctOption: q.correctOption.toUpperCase()
          }))
          setQuestions(formattedQuestions)
          setTotalPages(questionsData.data.totalPages)
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data)
        }
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

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Silme işlemi başarısız");
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
        body: JSON.stringify({
          ...newQuestion,
          correctOption: newQuestion.correctOption.toLowerCase()
        }),
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
          correctOption: editingQuestion.correctOption.toUpperCase(),
          categoryId: editingQuestion.categoryId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Güncelleme işlemi başarısız');
      }

      setQuestions(questions.map(q => 
        q.id === editingQuestion.id ? data.data : q
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              Soru Yönetimi
            </h1>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" /> Yeni Soru
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <Input
                placeholder="Soru ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all duration-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px] h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all duration-200">
                <SelectValue placeholder="Kategori seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Soru</TableHead>
                  <TableHead className="font-semibold">Şıklar</TableHead>
                  <TableHead className="font-semibold">Doğru Cevap</TableHead>
                  <TableHead className="font-semibold">Kategori</TableHead>
                  <TableHead className="font-semibold">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id} className="hover:bg-orange-50/50 transition-colors">
                    <TableCell className="font-medium">{question.id}</TableCell>
                    <TableCell className="max-w-md overflow-hidden text-ellipsis">
                      {question.questionText}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>A: {question.optionA}</div>
                        <div>B: {question.optionB}</div>
                        <div>C: {question.optionC}</div>
                        <div>D: {question.optionD}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                        {question.correctOption}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        {question.categoryName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingQuestion(question)
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
                              <AlertDialogTitle className="text-xl font-bold">Soruyu Sil</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                Bu soruyu silmek istediğinize emin misiniz?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="hover:bg-gray-100">İptal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(question.id)}
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

        {/* Soru Ekleme Modalı */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-md border-0 rounded-[32px] shadow-2xl max-w-2xl w-full p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 relative overflow-hidden">
              <DialogTitle className="text-2xl font-bold text-white m-0 relative z-10">
                Yeni Soru Ekle
              </DialogTitle>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full border-4 border-white" />
                <div className="absolute -left-8 -top-8 w-32 h-32 rounded-full border-4 border-white" />
              </div>
            </div>
            <form onSubmit={handleAddQuestion} className="p-8 space-y-6">
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
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-md border-0 rounded-[32px] shadow-2xl max-w-2xl w-full p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 relative overflow-hidden">
              <DialogTitle className="text-2xl font-bold text-white m-0 relative z-10">
                Soru Düzenle
              </DialogTitle>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full border-4 border-white" />
                <div className="absolute -left-8 -top-8 w-32 h-32 rounded-full border-4 border-white" />
              </div>
            </div>
            {editingQuestion && (
              <form onSubmit={handleEditQuestion} className="p-8 space-y-6">
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
                    <SelectTrigger id="edit-correctOption">
                      <SelectValue>{editingQuestion.correctOption}</SelectValue>
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
      </motion.div>
    </div>
  )
}