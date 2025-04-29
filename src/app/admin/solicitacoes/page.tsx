'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-browser-client';
import { getAprovacaoEmailTemplate, getRejeicaoEmailTemplate } from '@/lib/email';
import toast from 'react-hot-toast';
import { CheckIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { styles } from '@/constants/styles';
import AprovacaoModal from '@/components/AprovacaoModal';

interface Plano {
  id: string;
  nome: string;
  descricao: string;
}

interface Solicitacao {
  id: string;
  nome: string;
  email: string;
  cnpj: string;
  empresa_nome: string;
  justificativa: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: string;
  plano?: string;
}

export default function AdminSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSolicitacoes();
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .in('nome', ['Teste (7 dias)', 'Básico', 'Avançado'])
        .order('nome');

      if (error) throw error;
      setPlanos(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast.error('Erro ao carregar planos');
    }
  };

  const fetchSolicitacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitacoes_acesso')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSolicitacoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const handleAprovarClick = (solicitacao: Solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setModalOpen(true);
  };

  const handleAprovar = async (planoId: string) => {
    if (!solicitacaoSelecionada) return;

    try {
      // Gerar senha temporária
      const senhaTemporaria = Math.random().toString(36).slice(-8);

      // Criar empresa
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .insert({
          nome: solicitacaoSelecionada.empresa_nome,
          cnpj: solicitacaoSelecionada.cnpj,
          email: solicitacaoSelecionada.email,
          status: 'ativo',
          plano_id: planoId
        })
        .select()
        .single();

      if (empresaError) throw empresaError;

      // Criar usuário de autenticação
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: solicitacaoSelecionada.email,
        password: senhaTemporaria,
        email_confirm: true,
        user_metadata: {
          nome: solicitacaoSelecionada.nome,
          empresa_id: empresa.id,
          tipo: 'cliente'
        }
      });

      if (authError) throw authError;

      // Criar usuário na tabela usuarios
      const { error: userError } = await supabase
        .from('usuarios')
        .insert({
          id: authUser.user.id,
          nome: solicitacaoSelecionada.nome,
          email: solicitacaoSelecionada.email,
          empresa_id: empresa.id,
          tipo: 'cliente'
        });

      if (userError) throw userError;

      // Atualizar status da solicitação
      const { error: updateError } = await supabase
        .from('solicitacoes_acesso')
        .update({ 
          status: 'aprovado'
        })
        .eq('id', solicitacaoSelecionada.id);

      if (updateError) throw updateError;

      // Enviar e-mail de aprovação
      await sendEmail(
        solicitacaoSelecionada.email,
        'Sua solicitação foi aprovada!',
        getAprovacaoEmailTemplate(solicitacaoSelecionada.nome, solicitacaoSelecionada.email, senhaTemporaria)
      );

      toast.success('Solicitação aprovada com sucesso!');
      
      // Recarregar os dados
      fetchSolicitacoes();
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      toast.error('Erro ao aprovar solicitação');
      throw error;
    }
  };

  const sendEmail = async (to: string, subject: string, html: string) => {
    try {
      const response = await fetch(
        'https://pcxgwkcpgbkavgovhvzg.supabase.co/functions/v1/send-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ to, subject, html })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao enviar e-mail');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw error;
    }
  };

  const handleRejeitar = async (solicitacao: Solicitacao) => {
    try {
      // Atualizar status da solicitação
      const { error: updateError } = await supabase
        .from('solicitacoes_acesso')
        .update({ 
          status: 'rejeitado'
        })
        .eq('id', solicitacao.id);

      if (updateError) throw updateError;

      // Enviar e-mail de rejeição
      await sendEmail(
        solicitacao.email,
        'Sobre sua solicitação de acesso',
        getRejeicaoEmailTemplate(solicitacao.nome)
      );

      toast.success('Solicitação rejeitada com sucesso!');
      
      // Recarregar os dados
      fetchSolicitacoes();
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      toast.error('Erro ao rejeitar solicitação');
    }
  };

  const getStatusBadge = (status: 'pendente' | 'aprovado' | 'rejeitado') => {
    const statusStyles: Record<'pendente' | 'aprovado' | 'rejeitado', string> = {
      pendente: 'bg-yellow-100 text-yellow-800',
      aprovado: 'bg-green-100 text-green-800',
      rejeitado: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleOpenModal = (solicitacao: Solicitacao) => {
    setSelectedSolicitacao({
      ...solicitacao,
      plano: solicitacao.plano || 'teste'
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Solicitações de Acesso</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={styles.table.th}>Empresa</th>
                <th className={styles.table.th}>CNPJ</th>
                <th className={styles.table.th}>E-mail</th>
                <th className={styles.table.th}>Status</th>
                <th className={styles.table.th}>Data</th>
                <th className={styles.table.th}>Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {solicitacoes.map((solicitacao) => (
                <tr key={solicitacao.id}>
                  <td className={styles.table.td}>{solicitacao.empresa_nome}</td>
                  <td className={styles.table.td}>{solicitacao.cnpj}</td>
                  <td className={styles.table.td}>{solicitacao.email}</td>
                  <td className={styles.table.td}>
                    {getStatusBadge(solicitacao.status)}
                  </td>
                  <td className={styles.table.td}>
                    {new Date(solicitacao.created_at).toLocaleDateString()}
                  </td>
                  <td className={styles.table.td}>
                    {solicitacao.status === 'pendente' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAprovarClick(solicitacao)}
                          className="text-green-600 hover:text-green-800"
                          title="Aprovar"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRejeitar(solicitacao)}
                          className="text-red-600 hover:text-red-800"
                          title="Rejeitar"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(solicitacao)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Ver detalhes"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {solicitacaoSelecionada && (
        <AprovacaoModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSolicitacaoSelecionada(null);
          }}
          onConfirm={handleAprovar}
          solicitacao={solicitacaoSelecionada}
          planos={planos}
        />
      )}

      {selectedSolicitacao && (
        <AprovacaoModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSolicitacao(null);
          }}
          onConfirm={handleAprovar}
          solicitacao={selectedSolicitacao}
          planos={planos}
        />
      )}
    </div>
  );
} 