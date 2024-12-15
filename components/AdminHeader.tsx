"use client";
import Link from "next/link";
import { useState } from "react";
import { 
  Menu, 
  X, 
  PanelLeft, 
  Users, 
  FileText,
  Angry,
  Home, 
  Monitor 
} from "lucide-react";

function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { 
      href: "/admin", 
      label: "Ana Sayfa", 
      icon: <Home className="h-5 w-5 mr-2" /> 
    },
    { 
      href: "/admin/logs", 
      label: "Loglar", 
      icon: <FileText className="h-5 w-5 mr-2" /> 
    },
    { 
      href: "/admin/feedbacks", 
      label: "Geri Bildirimler", 
      icon: <Angry className="h-5 w-5 mr-2" /> 
    },
    { 
      href: "/admin/users", 
      label: "Kullanıcılar", 
      icon: <Users className="h-5 w-5 mr-2" /> 
    },
    { 
      href: "/", 
      label: "Kullanıcı Arayüzüne Dön", 
      icon: <Monitor className="h-5 w-5 mr-2" /> 
    }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <PanelLeft className="h-8 w-8 mr-3 text-orange-400" />
            <Link href="/admin" className="text-2xl font-bold tracking-tight">
              <h1>Admin Paneli</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="flex items-center hover:text-orange-400 transition-colors group"
                  >
                    {item.icon}
                    <span className="group-hover:underline">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-40 md:hidden">
            <nav className="fixed inset-y-0 right-0 max-w-xs w-full bg-gray-900 shadow-xl transform transition-transform">
              <div className="p-6 pt-16 space-y-4">
                {menuItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    onClick={toggleMenu}
                    className="flex items-center text-lg py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default AdminHeader;