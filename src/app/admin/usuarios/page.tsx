'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  funcao: string;
  ativo: boolean;
  created_at: string;
}

const funcoesFormatadas = {
  super_admin_lancei: 'Super Administrador',
  admin_lancei: 'Administrador',
  operador_lancei: 'Operador'
};

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    funcao: 'operador_lancei',
    ativo: true
  });
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClientComponentClient({
    supabaseUrl: 'https://pcxgwkcpgbkavgovhvzg.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeGd3a2NwZ2JrYXZnb3ZodnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjQxMTIsImV4cCI6MjA2MTUwMDExMn0.awyht15cRk9lM_U2O5zFjYwUme0zyvqG8U0iu_-5_TQ'
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('tipo_usuario', 'interno')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !['super_admin_lancei', 'admin_lancei'].includes(user.funcao || '')) {
      setError('Você não tem permissão para criar usuários');
      return;
    }

    try {
      const { error } = await supabase
        .from('usuarios')
        .insert([{
          ...formData,
          tipo_usuario: 'interno',
          senha: '123456' // Senha padrão que o usuário deve alterar no primeiro acesso
        }]);

      if (error) throw error;

      setShowForm(false);
      setFormData({
        nome: '',
        email: '',
        funcao: 'operador_lancei',
        ativo: true
      });
      fetchUsuarios();
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      setError('Erro ao criar usuário. Tente novamente.');
    }
  };

  const handleDesativarUsuario = async (usuarioId: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: !ativo })
        .eq('id', usuarioId);

      if (error) throw error;
      fetchUsuarios();
    } catch (err) {
      console.error('Erro ao alterar status do usuário:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuários Internos</h1>
        {user && ['super_admin_lancei', 'admin_lancei'].includes(user.funcao || '') && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Usuário
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Novo Usuário</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Função</label>
                <select
                  value={formData.funcao}
                  onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="operador_lancei">Operador</option>
                  <option value="admin_lancei">Administrador</option>
                  <option value="super_admin_lancei">Super Administrador</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Ativo</span>
                </label>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {funcoesFormatadas[usuario.funcao as keyof typeof funcoesFormatadas] || usuario.funcao}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDesativarUsuario(usuario.id, usuario.ativo)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {usuario.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 