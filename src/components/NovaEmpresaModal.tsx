'use client';

import { useState } from 'react';
import { styles } from '@/constants/styles';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase-browser-client';

interface NovaEmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NovaEmpresaModal({ isOpen, onClose, onSuccess }: NovaEmpresaModalProps) {
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('empresas')
        .insert([
          {
            nome,
            cnpj,
            email,
            status: 'pendente'
          },
        ]);

      if (error) throw error;

      toast.success('Empresa criada com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast.error('Erro ao criar empresa');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Nova Empresa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Empresa
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ
            </label>
            <input
              type="text"
              id="cnpj"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary"
              required
              pattern="\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 