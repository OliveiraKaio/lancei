'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser-client';
import { toast } from 'react-hot-toast';

export default function SolicitarAcesso() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    empresa_nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    justificativa: ''
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('solicitacoes_acesso')
        .insert([
          {
            ...form,
            status: 'pendente'
          },
        ]);

      if (error) throw error;

      toast.success('Solicitação enviada com sucesso!');
      router.push('/auth/login');
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error('Erro ao enviar solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Solicitar Acesso ao <span className="text-primary">Lancei</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Seu nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
          />
          <InputField
            label="Nome da empresa"
            name="empresa_nome"
            value={form.empresa_nome}
            onChange={handleChange}
            required
          />
          <InputField
            label="CNPJ"
            name="cnpj"
            pattern="\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}"
            title="Formato esperado: 00.000.000/0000-00"
            placeholder="00.000.000/0000-00"
            value={form.cnpj}
            onChange={handleChange}
            required
          />
          <InputField
            label="E-mail"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <InputField
            label="Telefone"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
          />

          <div>
            <label className="text-gray-700 font-medium">Justificativa do uso</label>
            <textarea
              name="justificativa"
              required
              rows={3}
              className="w-full border border-gray-300 rounded px-4 py-2 mt-1 focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Conte por que deseja utilizar o Lancei"
              value={form.justificativa}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar solicitação'}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  type = 'text',
  pattern,
  title,
  placeholder,
  value,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  pattern?: string;
  title?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-gray-700 font-medium">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        pattern={pattern}
        title={title}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded px-4 py-2 mt-1 text-gray-900 bg-white focus:ring-2 focus:ring-primary focus:outline-none"
      />
    </div>
  );
} 