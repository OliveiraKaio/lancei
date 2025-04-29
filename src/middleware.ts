import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Lista de rotas públicas que não requerem autenticação
  const publicRoutes = ['/', '/auth/login', '/auth/solicitar-acesso'];
  
  // Se a rota for pública, permitir o acesso
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return res;
  }

  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: 'https://pcxgwkcpgbkavgovhvzg.supabase.co',
      supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeGd3a2NwZ2JrYXZnb3ZodnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjQxMTIsImV4cCI6MjA2MTUwMDExMn0.awyht15cRk9lM_U2O5zFjYwUme0zyvqG8U0iu_-5_TQ'
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se o usuário não estiver autenticado e tentar acessar uma rota protegida
  if (!session && !publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Se o usuário estiver autenticado, verificar o tipo de usuário
  if (session) {
    const { data: userData } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', session.user.id)
      .single();

    // Se o usuário for interno e tentar acessar rotas do cliente
    if (userData?.tipo_usuario === 'interno' && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    // Se o usuário for cliente e tentar acessar rotas do admin
    if (userData?.tipo_usuario === 'cliente' && req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Se o usuário estiver autenticado e tentar acessar a página de login
    if (req.nextUrl.pathname.startsWith('/auth/login')) {
      return NextResponse.redirect(new URL(userData?.tipo_usuario === 'interno' ? '/admin/dashboard' : '/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 