'use client'

import { redirect, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user === null) {
      setIsLoading(true)
    } else {
      setIsLoading(false)
      if (!user.isAdmin) {
        redirect('/dashboard')
      }
    }
  }, [user])

  // Redirect to pending drivers if on the admin root
  useEffect(() => {
    if (pathname === '/dashboard/admin') {
      redirect('/dashboard/admin/pendingDrivers')
    }
  }, [pathname])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <nav className="flex space-x-4">
          <Link 
            href="/dashboard/admin/pendingDrivers"
            className={`px-4 py-2 rounded-md ${
              pathname === '/dashboard/admin/pendingDrivers' 
                ? 'bg-gray-100' 
                : 'hover:bg-gray-100'
            }`}
          >
            Pending Drivers
          </Link>
          <Link 
            href="/dashboard/admin/reviews"
            className={`px-4 py-2 rounded-md ${
              pathname === '/dashboard/admin/reviews' 
                ? 'bg-gray-100' 
                : 'hover:bg-gray-100'
            }`}
          >
            Reviews
          </Link>
        </nav>
      </div>
      {children}
    </div>
  )
} 