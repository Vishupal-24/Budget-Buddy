"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth/login?error=Authentication failed');
          return;
        }

        if (data?.session) {
          // Successfully authenticated, redirect to dashboard
          router.push('/dashboard');
        } else {
          // No session found, redirect to login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        router.push('/auth/login?error=Authentication failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm mx-auto p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="h-12 w-12 rounded-xl fast-skeleton" />
          <div className="space-y-3 w-full">
            <div className="h-6 w-48 mx-auto rounded fast-skeleton" />
            <div className="h-4 w-64 mx-auto rounded fast-skeleton" />
          </div>
          <div className="w-full space-y-3 pt-4">
            <div className="h-12 w-full rounded-lg fast-skeleton" />
            <div className="h-3 w-40 mx-auto rounded fast-skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}
