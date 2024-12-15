"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/swr-config";
import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Users, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";

// Define User interface for type safety
interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export default function AdminUsers() {
  // Pagination and data fetching
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const { 
    data, 
    error, 
    mutate, 
    isLoading 
  } = useSWR(
    `/api/admin/users?limit=${pageSize}&offset=${(page - 1) * pageSize}`, 
    fetcher
  );

  // State management for user editing and deletion
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<'user' | 'admin'>("user");
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  
  // Users and pagination state
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  
  // Modal and toast management
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Update users and total users when data changes
  useEffect(() => {
    if (data && data.data) {
      setTotalUsers(data.data.totalUsers || data.data.users.length);
      setUsers(data.data.users || []);
    }
  }, [data]);

  // Delete user handler
  const handleDelete = async () => {
    if (deleteUserId) {
      try {
        const response = await fetch(`/api/admin/users?id=${deleteUserId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error('Kullanıcı silinemedi');
        }

        mutate();
        setDeleteUserId(null);
        setIsDeleteModalOpen(false);
        
        toast({
          title: "Başarılı!",
          description: "Kullanıcı başarıyla silindi.",
          duration: 5000,
          className: "text-lg",
        });
      } catch (error) {
        console.error("Kullanıcı silme hatası:", error);
        toast({
          title: "Hata!",
          description: "Kullanıcı silinirken bir hata oluştu.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  // Open edit modal and populate fields
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
    setIsEditModalOpen(true);
  };

  // Update user handler
  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users?id=${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, role }),
      });

      if (!response.ok) {
        throw new Error('Kullanıcı güncellenemedi');
      }
      
      // Close the modal
      setIsEditModalOpen(false);
      
      // Reset editing state
      setEditingUser(null);
      
      // Refresh data
      mutate();
      
      // Show success toast
      toast({
        title: "Başarılı!",
        description: "Kullanıcı bilgileri güncellendi.",
      });
    } catch (error) {
      console.error("Kullanıcı güncelleme hatası:", error);
      toast({
        title: "Hata!",
        description: "Kullanıcı bilgileri güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 min-h-screen flex flex-col justify-center items-center">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          <p className="text-red-500 text-center mb-4">
            Kullanıcıları yüklerken bir hata oluştu: {error.message}
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen bg-gray-100">
        <LoadingSpinner className="text-orange-500 animate-spin h-12 w-12" />
      </div>
    );
  }

  // No users state
  if (users.length === 0) {
    return (
      <div className="p-6 min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <Users className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="text-xl text-gray-600">Henüz kullanıcı bulunmuyor.</p>
        </div>
      </div>
    );
  }

  // Calculate total pages
  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <ToastProvider>
      <div className="bg-gray-50 min-h-screen py-10">
        <main className="max-w-7xl mx-auto px-4">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="h-8 w-8" />
                Kullanıcı Yönetimi
              </h2>
            </div>

            {/* Users Table */}
            <Table className="w-full">
              <TableCaption className="bg-gray-50 p-2 text-gray-600">
                Toplam {totalUsers} kullanıcıdan {users.length} tanesi
              </TableCaption>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead>Kullanıcı Adı</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-800">{user.username}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-semibold 
                        ${user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                        }
                      `}>
                        {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(user.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4 mr-2" /> Düzenle
                        </Button>

                        {/* Delete Button */}
                        <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => setDeleteUserId(user.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Sil
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Kullanıcıyı Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu işlem geri alınamaz. Kullanıcı kalıcı olarak sistemden silinecektir.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete}>
                                Kullanıcıyı Sil
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white p-4 flex justify-between items-center border-t">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Önceki
                </Button>
                <span className="text-gray-600">
                  Sayfa {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2"
                >
                  Sonraki <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Edit User Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kullanıcı Bilgilerini Düzenle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
                  <Input 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <Input 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <Select 
                    value={role} 
                    onValueChange={(value: 'user' | 'admin') => setRole(value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Rol Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Kullanıcı</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleUpdate}
                  >
                    Kaydet
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ToastProvider>
  );
}