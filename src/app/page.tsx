import ProtectedRoute from '@/components/ProtectedRoute'
import { redirect } from 'next/navigation'

export default function Home() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Hello World</h1>
      </div>
    </ProtectedRoute>
  )
}