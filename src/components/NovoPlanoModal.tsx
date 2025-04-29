'use client';

import { useState } from 'react';
import { styles } from '@/constants/styles';
import { planosBase } from '@/constants/styles';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase-browser-client';

interface NovoPlanoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NovoPlanoModal({ isOpen, onClose, onSuccess }: NovoPlanoModalProps) {
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precoMensal, setPrecoMensal] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('planos')
        .insert([
          {
            nome,
            descricao,
            preco_mensal: parseFloat(precoMensal),
          },
        ]);

      if (error) throw error;

      toast.success('Plano criado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      toast.error('Erro ao criar plano');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal.overlay}>
      <div className={styles.modal.content}>
        <h2 className={styles.modal.title}>Novo Plano</h2>
        <form onSubmit={handleSubmit} className={styles.modal.form}>
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome do Plano
            </label>
            <select
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={styles.input}
              required
            >
              <option value="">Selecione um plano</option>
              {planosBase.map((plano) => (
                <option key={plano} value={plano}>
                  {plano.charAt(0).toUpperCase() + plano.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={styles.input}
              rows={3}
              required
            />
          </div>

          <div>
            <label htmlFor="precoMensal" className="block text-sm font-medium text-gray-700">
              Preço Mensal (R$)
            </label>
            <input
              type="number"
              id="precoMensal"
              value={precoMensal}
              onChange={(e) => setPrecoMensal(e.target.value)}
              className={styles.input}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={styles.button.secondary}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.button.primary}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 