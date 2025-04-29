'use client';

import { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase-browser-client';

export default function Notifications() {
  const [empresasPendentes, setEmpresasPendentes] = useState(0);

  useEffect(() => {
    const fetchEmpresasPendentes = async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('id')
        .eq('status', 'pendente');

      if (error) {
        console.error('Erro ao buscar empresas pendentes:', error);
        return;
      }

      setEmpresasPendentes(data?.length || 0);
    };

    fetchEmpresasPendentes();

    // Configurar real-time updates
    const subscription = supabase
      .channel('empresas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'empresas' }, () => {
        fetchEmpresasPendentes();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => window.location.href = '/admin/empresas?status=pendente'}
        className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <BellIcon className="h-6 w-6" />
        {empresasPendentes > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {empresasPendentes}
          </span>
        )}
      </button>
    </div>
  );
} 