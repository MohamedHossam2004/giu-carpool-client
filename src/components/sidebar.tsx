"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Car, Menu, Users, Star, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex items-center gap-2 p-4">
        <Menu className="h-5 w-5 text-black" />
        <div className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="GIU Logo"
            width={0}
            height={0}
            sizes="100%"
            className="w-[180px] h-auto"
            priority 
          />
        </div>
      </div>
      <div className="px-4 py-2">
        <h2 className="text-sm font-medium text-black">
          {user?.isAdmin ? "Admin Dashboard" : "Discover"}
        </h2>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {user?.isAdmin ? (
          <>
            <Link
              href="/dashboard/admin/pendingDrivers"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/dashboard/admin/pendingDrivers"
                  ? "bg-gray-100 text-black" 
                  : "text-black hover:bg-gray-50",
              )}
            >
              <Users className="h-5 w-5" />
              <span>Pending Drivers</span>
            </Link>

            <Link
              href="/dashboard/admin/reviews"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/dashboard/admin/reviews"
                  ? "bg-gray-100 text-black"
                  : "text-black hover:bg-gray-50",
              )}
            >
              <Star className="h-5 w-5" />
              <span>Reviews</span>
            </Link>

            <Link
              href="/dashboard/admin/payments"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/dashboard/admin/payments"
                  ? "bg-gray-100 text-black"
                  : "text-black hover:bg-gray-50",
              )}
            >
              <CreditCard className="h-5 w-5" />
              <span>Payments</span>
            </Link>

            <Link
              href="/dashboard/admin/rides"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/dashboard/admin/rides"
                  ? "bg-gray-100 text-black"
                  : "text-black hover:bg-gray-50",
              )}
            >
              <Car className="h-5 w-5" />
              <span>Rides</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/dashboard"
                  ? "bg-gray-100 text-black" 
                  : "text-black hover:bg-gray-50",
              )}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>

            <Link
              href="/find-ride"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/find-ride"
                  ? "bg-gray-100 text-black"
                  : "text-black hover:bg-gray-50",
              )}
            >
              <Search className="h-5 w-5" />
              <span>Find a Ride</span>
            </Link>

            <Link
              href="/ride-creation"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/ride-creation"
                  ? "bg-gray-100 text-black"
                  : "text-black hover:bg-gray-50",
              )}
            >
              <Car className="h-5 w-5" />
              <span>Ride Creation</span>
            </Link>
          </>
        )}
      </nav>
    </aside>
  )
}
