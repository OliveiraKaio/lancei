'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase-browser-client';
import toast from 'react-hot-toast';
import { styles } from '@/constants/styles';

interface Solicitacao {
  id: string;
  nome: string;
  empresa_nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  justificativa: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: string;
}

export default function DetalhesSolicitacao({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Solicitacao>>({});

  useEffect(() => {
    fetchSolicitacao();
  }, [params.id]);

  const fetchSolicitacao = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitacoes_acesso')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setSolicitacao(data);
      setFormData(data);
    } catch (error) {
      console.error('Erro ao buscar solicitação:', error);
      toast.error('Erro ao carregar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitacao) return;

    try {
      const { error } = await supabase
        .from('solicitacoes_acesso')
        .update({
          ...formData
        })
        .eq('id', solicitacao.id);

      if (error) throw error;

      toast.success('Solicitação atualizada com sucesso');
      setIsEditing(false);
      fetchSolicitacao();
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error);
      toast.error('Erro ao atualizar solicitação');
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

  const handleAprovar = async () => {
    if (!solicitacao) return;

    try {
      const { error } = await supabase
        .from('solicitacoes_acesso')
        .update({ 
          status: 'aprovado'
        })
        .eq('id', solicitacao.id);

      if (error) throw error;

      // Enviar e-mail de aprovação
      await sendEmail(
        solicitacao.email,
        'Solicitação de Acesso Aprovada - Lancei',
        `
          <h1>Sua solicitação foi aprovada!</h1>
          <p>Olá,</p>
          <p>Sua solicitação de acesso para a empresa ${solicitacao.empresa_nome} foi aprovada.</p>
          <p>Você receberá em breve um e-mail com instruções para criar sua conta.</p>
          <p>Atenciosamente,<br>Equipe Lancei</p>
        `
      );

      toast.success('Solicitação aprovada com sucesso');
      router.push('/admin/solicitacoes');
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      toast.error('Erro ao aprovar solicitação');
    }
  };

  const handleRejeitar = async () => {
    if (!solicitacao) return;

    try {
      const { error } = await supabase
        .from('solicitacoes_acesso')
        .update({ 
          status: 'rejeitado'
        })
        .eq('id', solicitacao.id);

      if (error) throw error;

      // Enviar e-mail de rejeição
      await sendEmail(
        solicitacao.email,
        'Solicitação de Acesso Rejeitada - Lancei',
        `
          <h1>Sua solicitação foi rejeitada</h1>
          <p>Olá,</p>
          <p>Infelizmente sua solicitação de acesso para a empresa ${solicitacao.empresa_nome} foi rejeitada.</p>
          <p>Se tiver alguma dúvida, entre em contato conosco.</p>
          <p>Atenciosamente,<br>Equipe Lancei</p>
        `
      );

      toast.success('Solicitação rejeitada com sucesso');
      router.push('/admin/solicitacoes');
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      toast.error('Erro ao rejeitar solicitação');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!solicitacao) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-gray-900">Solicitação não encontrada</h1>
        <button
          onClick={() => router.push('/admin/solicitacoes')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push('/admin/solicitacoes')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900 ml-4">Detalhes da Solicitação</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              solicitacao.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
              solicitacao.status === 'aprovado' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {solicitacao.status.charAt(0).toUpperCase() + solicitacao.status.slice(1)}
            </span>
          </div>
          {solicitacao.status === 'pendente' && (
            <div className="flex space-x-2">
              <button
                onClick={handleAprovar}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Aprovar
              </button>
              <button
                onClick={handleRejeitar}
                className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Rejeitar
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
              <input
                type="text"
                name="empresa_nome"
                value={formData.empresa_nome}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CNPJ</label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Justificativa</label>
              <textarea
                name="justificativa"
                value={formData.justificativa || ''}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Nome da Empresa</label>
              <p className="mt-1 text-gray-900">{solicitacao.empresa_nome}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">CNPJ</label>
              <p className="mt-1 text-gray-900">{solicitacao.cnpj}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">E-mail</label>
              <p className="mt-1 text-gray-900">{solicitacao.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Telefone</label>
              <p className="mt-1 text-gray-900">{solicitacao.telefone}</p>
            </div>
            {solicitacao.justificativa && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Justificativa</label>
                <p className="mt-1 text-gray-900">{solicitacao.justificativa}</p>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Editar
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <label className="block font-medium">Data de Criação</label>
              <p>{new Date(solicitacao.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 