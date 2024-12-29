"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Angry, Users, Monitor, Plus } from "lucide-react";

function AdminSidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { href: "/admin", label: "Genel", icon: <Home className="h-5 w-5" /> },
    { href: "/admin/logs", label: "Loglar", icon: <FileText className="h-5 w-5" /> },
    { href: "/admin/feedbacks", label: "Geri Bildirimler", icon: <Angry className="h-5 w-5" /> },
    { href: "/admin/users", label: "Kullanıcılar", icon: <Users className="h-5 w-5" /> },
    { href: "/admin/add-question", label: "Soru Ekle", icon: <Plus className="h-5 w-5" /> },
    { href: "/", label: "Kullanıcı Arayüzüne Dön", icon: <Monitor className="h-5 w-5" /> },
  ];

  return (
    <aside className="bg-orange-600 text-white w-64 flex-shrink-0">
      <div className="p-6">
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 
                      ${isActive 
                        ? 'bg-orange-700 shadow-md' 
                        : 'hover:bg-orange-700/70 hover:translate-x-1'
                      }`}
                  >
                    <span className="inline-flex items-center justify-center">
                      {item.icon}
                    </span>
                    <span className="ml-3 font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default AdminSidebar;