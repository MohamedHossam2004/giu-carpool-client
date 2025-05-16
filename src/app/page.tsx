'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 rounded-full bg-[#5F47E6] animate-ping" />
      </div>
    </ProtectedRoute>
  )
}