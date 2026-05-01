'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

/**
 * useAuth.js
 * 
 * Hook personalizado para manejar la sesión usando NextAuth.
 */
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user || null,
    role: session?.user?.role || null,
    loading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login: signIn,
    logout: signOut,
  };
}
