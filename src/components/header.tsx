import { Search, User } from "lucide-react"

export default function Header() {
  return (
    <header className="border-b border-gray-200 p-5 flex items-center justify-between">
      <div className="font-medium text-lg">GIU Car Pooling App</div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="py-2.5 pl-10 pr-4 rounded-md border border-gray-300 bg-gray-50 text-base w-[220px]"
          />
        </div>
        <button className="p-2.5 rounded-full hover:bg-gray-100">
          <User className="h-7 w-7" />
        </button>
      </div>
    </header>
  )
}
