import { supabase } from '@/lib/supabase-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Testa apenas a conexão com o Supabase
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        { 
          error: error.message,
          details: 'Erro ao autenticar com o Supabase'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Conexão com Supabase estabelecida com sucesso',
      session: !!session // Retorna true se houver uma sessão
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Erro ao conectar com o Supabase',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 