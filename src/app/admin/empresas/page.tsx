'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PencilIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase-browser-client';
import { toast } from 'react-hot-toast';
import { styles } from '@/constants/styles';

interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  status: string;
  created_at: string;
  plano: {
    nome: string;
  };
}

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*, plano:planos(nome)')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleDesativar = async (empresa: Empresa) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('empresas')
        .update({ status: 'inativo' })
        .eq('id', empresa.id);

      if (error) throw error;

      toast.success('Empresa desativada com sucesso!');
      fetchEmpresas();
    } catch (error) {
      console.error('Erro ao desativar empresa:', error);
      toast.error('Erro ao desativar empresa');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Empresas Ativas</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={styles.table.th}>Empresa</th>
              <th className={styles.table.th}>CNPJ</th>
              <th className={styles.table.th}>Plano</th>
              <th className={styles.table.th}>Status</th>
              <th className={styles.table.th}>Data</th>
              <th className={styles.table.th}>Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {empresas.map((empresa) => (
              <tr key={empresa.id}>
                <td className={styles.table.td}>{empresa.nome}</td>
                <td className={styles.table.td}>{empresa.cnpj}</td>
                <td className={styles.table.td}>{empresa.plano?.nome || '-'}</td>
                <td className={styles.table.td}>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Ativo
                  </span>
                </td>
                <td className={styles.table.td}>
                  {new Date(empresa.created_at).toLocaleDateString()}
                </td>
                <td className={styles.table.td}>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/admin/empresas/${empresa.id}/edit`)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDesativar(empresa)}
                      className="text-red-600 hover:text-red-800"
                      title="Desativar"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 