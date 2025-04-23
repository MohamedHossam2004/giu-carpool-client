"use client"

import Link from "next/link"
import { Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center">
        <Link href="/dashboard" className="text-lg font-semibold text-black">
          GIU Car Pooling App
        </Link>
      </div>

      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />
        <Input placeholder="Search" className="h-9 pl-9 pr-4 text-sm text-black bg-white placeholder:text-black" />
      </div>

      <div>
        <Link href="/dashboard/profile" className="rounded-full p-1 hover:bg-gray-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
            <User className="h-6 w-6 text-gray-500" />
          </div>
          <span className="sr-only">Profile</span>
        </Link>
      </div>
    </header>
  )
}
