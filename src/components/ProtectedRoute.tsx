'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  driverOnly?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  driverOnly = false 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if token exists in cookies
    const token = Cookies.get('accessToken');
    
    if (!loading) {
      if (!isAuthenticated || !token) {
        router.push('/login');
      } else if (pathname.startsWith('/dashboard/admin') && !user?.isAdmin) {
        // Prevent non-admin users from accessing admin routes
        router.push('/dashboard');
      } else if (user?.isAdmin && !pathname.startsWith('/dashboard/admin')) {
        router.push('/dashboard/admin');
      } else if (adminOnly && !user?.isAdmin) {
        router.push('/dashboard');
      } else if (driverOnly && !user?.isDriver && !user?.isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [loading, isAuthenticated, user, adminOnly, driverOnly, router, pathname]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated || 
      (adminOnly && !user?.isAdmin) || 
      (driverOnly && !user?.isDriver && !user?.isAdmin)) {
    return null;
  }

  return <>{children}</>;
}