'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  tipo_usuario: 'interno' | 'cliente';
  funcao?: string;
  nome?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

// Fallback values if environment variables are not available
const FALLBACK_URL = 'https://pcxgwkcpgbkavgovhvzg.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeGd3a2NwZ2JrYXZnb3ZodnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjQxMTIsImV4cCI6MjA2MTUwMDExMn0.awyht15cRk9lM_U2O5zFjYwUme0zyvqG8U0iu_-5_TQ';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          toast.error('Erro de conexão. Verifique sua internet ou tente novamente mais tarde.');
          return;
        }
        
        if (!session) {
          setUser(null);
          setLoading(false);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('Erro ao obter dados do usuário:', userError);
          if (userError.message?.includes('network')) {
            toast.error('Erro de conexão. Verifique sua internet ou tente novamente mais tarde.');
          }
          throw userError;
        }

        if (!userData) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser({
          id: userData.id,
          email: userData.email,
          tipo_usuario: userData.tipo_usuario,
          funcao: userData.funcao,
          nome: userData.nome
        });

        // Redireciona baseado no tipo de usuário
        if (userData.tipo_usuario === 'interno') {
          router.push('/admin/dashboard');
        } else if (userData.tipo_usuario === 'cliente') {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUser();
      } else {
        setUser(null);
        router.push('/auth/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 