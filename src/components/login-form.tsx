"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

interface LoginFormProps {
  username: string
  setUsername: (value: string) => void
  getDomainSuffix: () => string
  onSubmit: () => void
}

export default function LoginForm({ username, setUsername, getDomainSuffix, onSubmit }: LoginFormProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()

  const handleSubmit = async () => {
    setError("")
    
    if (!username) {
      setError("Username is required")
      return
    }
    
    if (!password) {
      setError("Password is required")
      return
    }

    const email = username + getDomainSuffix()
    const result = await login(email, password)
    
    if (result.success) {
      onSubmit()
    } else {
      setError(result.message)
    }
  }

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
              required
            />
            <div className="flex items-center bg-gray-100 px-3 text-xs text-gray-500">{getDomainSuffix()}</div>
          </div>
          <Input 
            type="password" 
            placeholder="Password" 
            className="bg-white h-8 text-sm placeholder:text-gray-400 text-black" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <div className="text-sm text-red-500 text-center">
              {error}
            </div>
          )}
          <Button 
            className="w-full bg-black text-white hover:bg-gray-800 h-8 text-sm" 
            onClick={handleSubmit}
          >
            Sign in
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
