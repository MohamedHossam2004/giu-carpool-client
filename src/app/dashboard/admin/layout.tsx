'use client'

import { redirect, usePathname } from 'next/navigation'
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
    <div className="flex-1 w-full">
      {children}
    </div>
  )
} 