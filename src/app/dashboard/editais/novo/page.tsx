'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';

const editalSchema = z.object({
  nome_orgao: z.string().min(1, 'Nome do órgão é obrigatório'),
  numero_edital: z.string().min(1, 'Número do edital é obrigatório'),
  plataforma: z.string().min(1, 'Plataforma é obrigatória'),
  link_edital: z.string().url('Link do edital deve ser uma URL válida'),
  data_disputa: z.string().min(1, 'Data da disputa é obrigatória'),
  prazo_proposta: z.string().min(1, 'Prazo para proposta é obrigatório'),
});

export default function NovoEdital() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome_orgao: '',
    numero_edital: '',
    plataforma: '',
    link_edital: '',
    data_disputa: '',
    prazo_proposta: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validatedData = editalSchema.parse(formData);

      const { error } = await supabase
        .from('editais')
        .insert([{
          ...validatedData,
          status: 'em_andamento',
        }]);

      if (error) throw error;

      router.push('/dashboard/editais');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao cadastrar o edital');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Novo Edital</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="nome_orgao" className="block text-sm font-medium text-gray-700">
                Nome do Órgão
              </label>
              <input
                type="text"
                name="nome_orgao"
                id="nome_orgao"
                value={formData.nome_orgao}
                onChange={handleChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="numero_edital" className="block text-sm font-medium text-gray-700">
                Número do Edital
              </label>
              <input
                type="text"
                name="numero_edital"
                id="numero_edital"
                value={formData.numero_edital}
                onChange={handleChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="plataforma" className="block text-sm font-medium text-gray-700">
                Plataforma
              </label>
              <input
                type="text"
                name="plataforma"
                id="plataforma"
                value={formData.plataforma}
                onChange={handleChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6">
              <label htmlFor="link_edital" className="block text-sm font-medium text-gray-700">
                Link do Edital
              </label>
              <input
                type="url"
                name="link_edital"
                id="link_edital"
                value={formData.link_edital}
                onChange={handleChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="data_disputa" className="block text-sm font-medium text-gray-700">
                Data da Disputa
              </label>
              <input
                type="datetime-local"
                name="data_disputa"
                id="data_disputa"
                value={formData.data_disputa}
                onChange={handleChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="prazo_proposta" className="block text-sm font-medium text-gray-700">
                Prazo para Proposta
              </label>
              <input
                type="datetime-local"
                name="prazo_proposta"
                id="prazo_proposta"
                value={formData.prazo_proposta}
                onChange={handleChange}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
} 