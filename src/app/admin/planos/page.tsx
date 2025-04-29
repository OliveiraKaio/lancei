'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { styles } from '@/constants/styles';
import { toast } from 'react-hot-toast';
import NovoPlanoModal from '@/components/NovoPlanoModal';
import { supabase } from '@/lib/supabase-browser-client';

interface Plano {
  id: string;
  nome: string;
  descricao: string;
  preco_mensal: number;
  status: string;
  created_at: string;
}

export default function AdminPlanos() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const fetchPlanos = async () => {
    try {
      const { data: planosData, error } = await supabase
        .from('planos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear os dados para manter compatibilidade com o campo valor
      const planosFormatados = (planosData || []).map(plano => ({
        ...plano,
        valor: plano.preco_mensal // Mantendo valor como alias
      }));
      
      setPlanos(planosFormatados);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('funcao')
          .eq('id', user.id)
          .single();
        setUserRole(usuario?.funcao);
      }
    };

    fetchUserRole();
    fetchPlanos();
  }, []);

  const handleDeletePlano = async (planoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;

    try {
      const { error } = await supabase
        .from('planos')
        .delete()
        .eq('id', planoId);

      if (error) throw error;

      setPlanos(planos.filter(plano => plano.id !== planoId));
      toast.success('Plano excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast.error('Erro ao excluir plano');
    }
  };

  const handleSuccess = () => {
    fetchPlanos();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Planos</h1>
        {(userRole === 'super_admin_lancei' || userRole === 'admin_lancei') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className={styles.button.primary}
          >
            Novo Plano
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={styles.table.th}>Nome</th>
              <th className={styles.table.th}>Preço Mensal</th>
              <th className={styles.table.th}>Descrição</th>
              <th className={styles.table.th}>Data de Criação</th>
              <th className={styles.table.th}>Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {planos.map((plano) => (
              <tr key={plano.id}>
                <td className={styles.table.td}>{plano.nome}</td>
                <td className={styles.table.td}>
                  R$ {plano.preco_mensal.toFixed(2)}
                </td>
                <td className={styles.table.td}>{plano.descricao}</td>
                <td className={styles.table.td}>
                  {new Date(plano.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className={styles.table.td}>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/admin/planos/${plano.id}`)}
                      className="text-primary hover:text-primary/90"
                      title="Editar plano"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlano(plano.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir plano"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NovoPlanoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
} 