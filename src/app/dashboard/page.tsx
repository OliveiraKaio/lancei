'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  empresa_id: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    licitacoesHoje: 0,
    entregasPendentes: 0,
    documentosVencidos: 0,
  });

  const { user } = useAuth() as { user: User | null };
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchStats = async () => {
      try {
        // Buscar licitações do dia
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const { data: licitacoes, error: licitacoesError } = await supabase
          .from('licitacoes')
          .select('count')
          .gte('created_at', hoje.toISOString())
          .eq('empresa_id', user.empresa_id)
          .single();

        if (licitacoesError) throw licitacoesError;

        // Buscar entregas pendentes
        const { data: entregas, error: entregasError } = await supabase
          .from('entregas')
          .select('count')
          .eq('status', 'pendente')
          .eq('empresa_id', user.empresa_id)
          .single();

        if (entregasError) throw entregasError;

        // Buscar documentos vencidos
        const { data: documentos, error: documentosError } = await supabase
          .from('documentos')
          .select('count')
          .lt('data_vencimento', new Date().toISOString())
          .eq('empresa_id', user.empresa_id)
          .single();

        if (documentosError) throw documentosError;

        setStats({
          licitacoesHoje: licitacoes?.count || 0,
          entregasPendentes: entregas?.count || 0,
          documentosVencidos: documentos?.count || 0,
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        toast.error('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card de Licitações do Dia */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Licitações do Dia
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.licitacoesHoje}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Entregas Pendentes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Entregas Pendentes
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.entregasPendentes}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Documentos Vencidos */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Documentos Vencidos
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.documentosVencidos}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 