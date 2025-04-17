"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LoginFormProps {
  username: string
  setUsername: (value: string) => void
  getDomainSuffix: () => string
}

export default function LoginForm({ username, setUsername, getDomainSuffix }: LoginFormProps) {
  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-3">
        {/* Login Form */}
        <div className="space-y-3">
          {/* Custom Email Input with Domain Suffix */}
          <div className="flex overflow-hidden rounded-md">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="fname.lname"
              className="flex-1 h-8 rounded-r-none border-r-0 bg-white text-sm placeholder:text-gray-400 text-black"
            />
            <div className="flex items-center bg-gray-100 px-3 text-xs text-gray-500">{getDomainSuffix()}</div>
          </div>
          <Input type="password" placeholder="Password" className="bg-white h-8 text-sm placeholder:text-gray-400 text-black" />
          <Button className="w-full bg-black text-white hover:bg-gray-800 h-8 text-sm">Sign in</Button>
        </div>
      </div>
    </motion.div>
  )
}
