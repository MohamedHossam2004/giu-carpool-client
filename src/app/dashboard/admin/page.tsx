'use client'

import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/dashboard/admin/pendingDrivers')
} 