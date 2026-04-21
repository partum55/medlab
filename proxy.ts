import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/dashboard', '/orders', '/specimens', '/reports', '/profile'];

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // If env vars missing, pass through — page components will handle auth
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isProtected = PROTECTED.some(prefix => pathname.startsWith(prefix));

    if (!user && isProtected) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = '/login';
      return NextResponse.redirect(redirect);
    }

    if (user && pathname === '/login') {
      const redirect = request.nextUrl.clone();
      redirect.pathname = '/';
      return NextResponse.redirect(redirect);
    }
  } catch {
    // Supabase unreachable — pass through, page components handle auth
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
