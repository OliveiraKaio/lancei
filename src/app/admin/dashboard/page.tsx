'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmpresas: 0,
    empresasTeste: 0,
    usuariosAtivos: 0,
    planosAtivos: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient({
    supabaseUrl: 'https://pcxgwkcpgbkavgovhvzg.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeGd3a2NwZ2JrYXZnb3ZodnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjQxMTIsImV4cCI6MjA2MTUwMDExMn0.awyht15cRk9lM_U2O5zFjYwUme0zyvqG8U0iu_-5_TQ'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total de empresas
        const { count: totalEmpresas } = await supabase
          .from('empresas')
          .select('*', { count: 'exact', head: true });

        // Empresas em teste
        const { count: empresasTeste } = await supabase
          .from('empresas')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'teste');

        // Usuários ativos
        const { count: usuariosAtivos } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true);

        // Planos ativos
        const { count: planosAtivos } = await supabase
          .from('planos')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalEmpresas: totalEmpresas || 0,
          empresasTeste: empresasTeste || 0,
          usuariosAtivos: usuariosAtivos || 0,
          planosAtivos: planosAtivos || 0
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      name: 'Total de Empresas',
      value: stats.totalEmpresas,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Empresas em Teste',
      value: stats.empresasTeste,
      icon: CheckCircleIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Usuários Ativos',
      value: stats.usuariosAtivos,
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Planos Ativos',
      value: stats.planosAtivos,
      icon: CreditCardIcon,
      color: 'bg-yellow-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => window.location.href = '/admin/empresas/nova'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Aprovar Empresa
          </button>
          <button
            onClick={() => window.location.href = '/admin/planos/novo'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Criar Plano
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${card.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.name}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {card.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder para gráfico de crescimento */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Crescimento de Empresas
        </h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Gráfico de crescimento (em desenvolvimento)
        </div>
      </div>
    </div>
  );
} 