'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
    } else if (user.role === 'customer') {
      router.push('/dashboard/customer');
    } else if (user.role === 'artisan') {
      router.push('/dashboard/artisan');
    } else if (user.role === 'admin') {
      router.push('/dashboard/admin');
    }
  }, [user, loading, router]);

  return <LoadingSpinner message="Redirecting to your workspace..." fullPage />;
}
