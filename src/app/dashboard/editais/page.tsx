'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

interface Edital {
  id: string;
  nome_orgao: string;
  numero_edital: string;
  plataforma: string;
  data_disputa: string;
  status: 'em_andamento' | 'finalizado' | 'cancelado';
  created_at: string;
}

export default function Editais() {
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchEditais = async () => {
      try {
        const { data, error } = await supabase
          .from('editais')
          .select('*')
          .order('data_disputa', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEditais(data || []);
      } catch (error) {
        console.error('Erro ao buscar editais:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEditais();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Editais</h1>
        <Link
          href="/dashboard/editais/novo"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Novo Edital
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {editais.map((edital) => (
            <li key={edital.id}>
              <Link href={`/dashboard/editais/${edital.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-indigo-600 truncate">
                      {edital.nome_orgao} - {edital.numero_edital}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        edital.status === 'em_andamento' ? 'bg-green-100 text-green-800' :
                        edital.status === 'finalizado' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {edital.status === 'em_andamento' ? 'Em Andamento' :
                         edital.status === 'finalizado' ? 'Finalizado' : 'Cancelado'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {edital.plataforma}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(edital.data_disputa).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 