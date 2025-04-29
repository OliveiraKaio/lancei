import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { data: empresas } = await supabase
      .from('empresas')
      .select('*')
      .eq('plano', 'teste');

    const hoje = new Date();
    const empresasAtualizadas = [];

    for (const empresa of empresas) {
      const dataInicio = new Date(empresa.data_inicio_teste);
      const diffDias = Math.floor((hoje - dataInicio) / (1000 * 60 * 60 * 24));

      if (diffDias >= 7) {
        const { data, error } = await supabase
          .from('empresas')
          .update({ plano: 'expirado' })
          .eq('id', empresa.id)
          .select()
          .single();

        if (data) {
          empresasAtualizadas.push(data);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Verificação concluída', 
        empresasAtualizadas 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 