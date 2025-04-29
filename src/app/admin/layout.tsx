'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UsersIcon, 
  CreditCardIcon, 
  BellIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.tipo_usuario !== 'interno') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user || user.tipo_usuario !== 'interno') {
    return null;
  }

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: HomeIcon,
      roles: ['super_admin_lancei', 'admin_lancei', 'operador_lancei']
    },
    {
      name: 'Solicitações',
      href: '/admin/solicitacoes',
      icon: ClipboardDocumentListIcon,
      roles: ['super_admin_lancei', 'admin_lancei', 'operador_lancei']
    },
    {
      name: 'Empresas',
      href: '/admin/empresas',
      icon: BuildingOfficeIcon,
      roles: ['super_admin_lancei', 'admin_lancei', 'operador_lancei']
    },
    {
      name: 'Usuários',
      href: '/admin/usuarios',
      icon: UsersIcon,
      roles: ['super_admin_lancei', 'admin_lancei']
    },
    {
      name: 'Planos',
      href: '/admin/planos',
      icon: CreditCardIcon,
      roles: ['super_admin_lancei', 'admin_lancei']
    },
    {
      name: 'Notificações',
      href: '/admin/notificacoes',
      icon: BellIcon,
      roles: ['super_admin_lancei', 'admin_lancei', 'operador_lancei']
    },
    {
      name: 'Relatórios',
      href: '/admin/relatorios',
      icon: ChartBarIcon,
      roles: ['super_admin_lancei', 'admin_lancei']
    },
    {
      name: 'Configurações',
      href: '/admin/configuracoes',
      icon: Cog6ToothIcon,
      roles: ['super_admin_lancei']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.funcao || '')
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
            <span className="text-white font-bold text-xl">Lancei Admin</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  {user?.nome?.[0] || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.nome}</p>
                <p className="text-xs text-gray-500">{user?.funcao}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="mt-4 w-full text-left px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 