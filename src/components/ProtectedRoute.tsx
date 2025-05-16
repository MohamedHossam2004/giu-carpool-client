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
      } else if (user?.isAdmin) {
        // If user is admin and not on an admin route, redirect to admin dashboard
        if (!pathname.startsWith('/dashboard/admin')) {
          router.push('/dashboard/admin');
        }
      } else if (pathname.startsWith('/dashboard/admin')) {
        // If non-admin user tries to access admin routes, redirect to user dashboard
        router.push('/dashboard');
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