import Link from "next/link"
import Image from "next/image"
import { Home, Search, Car } from "lucide-react"

export default function Sidebar() {
  return (
    <div className="w-[150px] border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <Link href="/">
          <div className="flex items-center justify-center">
            <Image src="/giu-logo.png" alt="GIU Logo" width={110} height={80} className="mr-2" />
          </div>
        </Link>
      </div>

      <div className="flex-1">
        <div className="px-4 py-3 text-sm font-medium text-gray-500">Discover</div>
        <nav className="space-y-1">
          <Link href="/" className="flex items-center px-4 py-2.5 text-base hover:bg-gray-100">
            <Home size={20} className="mr-3" />
            Home
          </Link>
          <Link href="/find-ride" className="flex items-center px-4 py-2.5 text-base bg-gray-100 font-medium">
            <Search size={20} className="mr-3" />
            Find a Ride
          </Link>
          <Link href="/ride-creation" className="flex items-center px-4 py-2.5 text-base hover:bg-gray-100">
            <Car size={20} className="mr-3" />
            Ride Creation
          </Link>
        </nav>
      </div>
    </div>
  )
}
