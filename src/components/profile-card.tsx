"use client"

import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery, useMutation } from "@apollo/client"
import { ME_QUERY, DELETE_USER_MUTATION } from "@/lib/graphql/queries"
import { useState, useEffect } from "react"
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { getDriverRating } from "@/lib/services/rating"

export function ProfileCard() {
  const router = useRouter()
  const accessToken = Cookies.get('accessToken')
  const { data, loading, error } = useQuery(ME_QUERY, {
    context: {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }
  })
  const [deleteUser] = useMutation(DELETE_USER_MUTATION, {
    context: {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [driverRating, setDriverRating] = useState<{ averageRating: number; reviewCount: number } | null>(null)

  useEffect(() => {
    const fetchDriverRating = async () => {
      if (data?.me?.driver?.id) {
        console.log(data.me.driver.id)
        const rating = await getDriverRating(data.me.driver.id)
        setDriverRating(rating)
      }
    }
    fetchDriverRating()
  }, [data?.me?.driver?.id])

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      const { data } = await deleteUser()
      
      if (data?.deleteUser?.message) {
        // Clear cookies and redirect to login
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        Cookies.remove('user')
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
      setIsDeleting(false)
    }
  }

  const handleLogout = () => {
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    Cookies.remove('user')
    router.push('/login')
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading profile</div>

  const user = data?.me
  if (!user) return <div>No user data found</div>

  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <div className="rounded-lg bg-gray-100 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
            <svg className="h-10 w-10 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-black">{fullName}</h2>
            {user.isDriver && driverRating && (
              <div className="flex items-center gap-1">
                <span className="font-medium text-black">{driverRating.averageRating.toFixed(1)}</span>
                <Star className="h-5 w-5 fill-current text-yellow-400" />
                <span className="text-sm text-gray-500">({driverRating.reviewCount})</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-0.5 w-full bg-gray-200" />
        
        <div className="flex justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-black">Phone Number:</p>
              <p className="mt-1 inline-block rounded-md bg-gray-200 px-3 py-1 text-sm text-black">{user.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-black">Email:</p>
              <p className="mt-1 inline-block rounded-md bg-gray-200 px-3 py-1 text-sm text-black">{user.email}</p>
            </div>
            {user.giuId && (
              <div>
                <p className="text-sm text-black">GIU ID:</p>
                <p className="mt-1 inline-block rounded-md bg-gray-200 px-3 py-1 text-sm text-black">{user.giuId}</p>
              </div>
            )}
            {user.isDriver && user.driver?.car && (
              <div>
                <p className="text-sm text-black">Car Details:</p>
                <div className="mt-1 space-y-1">
                  <p className="inline-block rounded-md bg-gray-200 px-3 py-1 text-sm text-black">
                    {user.driver.car.vehicleName} ({user.driver.car.year})
                  </p>
                  <p className="inline-block rounded-md bg-gray-200 px-3 py-1 text-sm ml-2 text-black">
                    License: {user.driver.car.licensePlate}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 self-end">
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="h-fit"
            >
              Logout
            </Button>
            <Button 
              variant="destructive" 
              disabled={isDeleting}
              onClick={handleDeleteAccount}
              className="bg-red-600 text-white hover:bg-red-700 h-fit"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
