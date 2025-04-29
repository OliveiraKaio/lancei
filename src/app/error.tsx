'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Erro capturado:', error);
  }, [error]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-red-600">Ocorreu um erro inesperado</h2>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Tentar novamente
      </button>
    </div>
  );
} 