'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusIcon } from '@heroicons/react/24/outline';

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  destinatario: string;
  data_envio: string;
  status: string;
}

export default function AdminNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    mensagem: '',
    destinatario: 'todos',
    data_agendamento: '',
    enviar_agora: true
  });
  const supabase = createClientComponentClient({
    supabaseUrl: 'https://pcxgwkcpgbkavgovhvzg.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeGd3a2NwZ2JrYXZnb3ZodnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjQxMTIsImV4cCI6MjA2MTUwMDExMn0.awyht15cRk9lM_U2O5zFjYwUme0zyvqG8U0iu_-5_TQ'
  });

  useEffect(() => {
    fetchNotificacoes();
  }, []);

  const fetchNotificacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .order('data_envio', { ascending: false });

      if (error) throw error;
      setNotificacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('notificacoes')
        .insert([{
          titulo: formData.titulo,
          mensagem: formData.mensagem,
          destinatario: formData.destinatario,
          data_envio: formData.enviar_agora ? new Date().toISOString() : formData.data_agendamento,
          status: 'pendente'
        }]);

      if (error) throw error;
      
      setFormData({
        titulo: '',
        mensagem: '',
        destinatario: 'todos',
        data_agendamento: '',
        enviar_agora: true
      });
      setShowForm(false);
      fetchNotificacoes();
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  };

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
        <h1 className="text-2xl font-semibold text-gray-900">Notificações</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nova Notificação
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Nova Notificação</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
                Título
              </label>
              <input
                type="text"
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700">
                Mensagem
              </label>
              <textarea
                id="mensagem"
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="destinatario" className="block text-sm font-medium text-gray-700">
                Destinatário
              </label>
              <select
                id="destinatario"
                value={formData.destinatario}
                onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="todos">Todos os Usuários</option>
                <option value="teste">Usuários em Teste</option>
                <option value="ativo">Usuários Ativos</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enviar_agora"
                checked={formData.enviar_agora}
                onChange={(e) => setFormData({ ...formData, enviar_agora: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="enviar_agora" className="ml-2 block text-sm text-gray-900">
                Enviar Agora
              </label>
            </div>

            {!formData.enviar_agora && (
              <div>
                <label htmlFor="data_agendamento" className="block text-sm font-medium text-gray-700">
                  Data de Envio
                </label>
                <input
                  type="datetime-local"
                  id="data_agendamento"
                  value={formData.data_agendamento}
                  onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required={!formData.enviar_agora}
                />
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destinatário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Envio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notificacoes.map((notificacao) => (
              <tr key={notificacao.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {notificacao.titulo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {notificacao.destinatario}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(notificacao.data_envio).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    notificacao.status === 'enviado' ? 'bg-green-100 text-green-800' :
                    notificacao.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {notificacao.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 