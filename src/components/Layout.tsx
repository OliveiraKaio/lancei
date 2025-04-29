'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { funcoesFormatadas, styles } from '@/constants/styles';
import { supabase } from '@/lib/supabase-browser-client';
import Notifications from './Notifications';

interface LayoutProps {
  children: React.ReactNode;
}

interface UserMetadata {
  tipo?: string;
  nome?: string;
  funcao?: keyof typeof funcoesFormatadas;
}

interface UserWithMetadata {
  user_metadata?: UserMetadata;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const clienteMenu = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Editais', href: '/dashboard/editais', icon: ClipboardDocumentListIcon },
    { name: 'Configurações', href: '/dashboard/configuracoes', icon: Cog6ToothIcon },
  ];

  const adminMenu = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Empresas', href: '/admin/empresas', icon: UserGroupIcon },
    { name: 'Planos', href: '/admin/planos', icon: ChartBarIcon },
    { name: 'Configurações', href: '/admin/configuracoes', icon: Cog6ToothIcon },
  ];

  const userWithMetadata = user as UserWithMetadata | undefined;
  const userMetadata = userWithMetadata?.user_metadata;
  const userType = userMetadata?.tipo || 'cliente';
  const menuItems = userType === 'cliente' ? clienteMenu : adminMenu;

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Image
              src="/lancei_logo.png"
              alt="Logo Lancei"
              width={140}
              height={40}
              priority
              className="object-contain"
            />
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 py-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="inline-block h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                  {userMetadata?.nome?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {userMetadata?.nome || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">
                  {userMetadata?.funcao ? funcoesFormatadas[userMetadata.funcao] : 'Cliente'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full mt-4 flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`${isSidebarOpen ? 'pl-64' : ''}`}>
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {!isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <Notifications />
              </div>
            </div>
          </div>
        </nav>
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 