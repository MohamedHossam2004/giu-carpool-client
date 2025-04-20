"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

interface RegisterFormProps {
  username: string
  setUsername: (value: string) => void
  getDomainSuffix: () => string
  isDriver: boolean
  setIsDriver: (value: boolean) => void
  setRegistrationStep: (value: "personal" | "car" | "verification") => void
  setEmail: (value: string) => void
  userInfo: {
    password: string
    firstName: string
    lastName: string
    giuId: string
    phone: string
    gender: boolean
  }
  setUserInfo: (value: {
    password: string
    firstName: string
    lastName: string
    giuId: string
    phone: string
    gender: boolean
  }) => void
}

export default function RegisterForm({
  username,
  setUsername,
  getDomainSuffix,
  isDriver,
  setIsDriver,
  setRegistrationStep,
  setEmail,
  userInfo,
  setUserInfo
}: RegisterFormProps) {
  const [error, setError] = useState("")
  const { register } = useAuth()

  const handleSubmit = async () => {
    setError("")
    
    // Validate required fields
    if (!userInfo.firstName || !userInfo.lastName || !userInfo.giuId || !userInfo.phone || !userInfo.password) {
      setError("All fields are required")
      return
    }

    // Validate password strength
    if (userInfo.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    // If user is a driver, just transition to car details
    if (isDriver) {
      setEmail(username + getDomainSuffix())
      setRegistrationStep("car")
      return
    }

    // Only register if not a driver
    const result = await register({
      email: username + getDomainSuffix(),
      password: userInfo.password,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      giuId: userInfo.giuId,
      phone: userInfo.phone,
      gender: userInfo.gender,
      isDriver: false
    })

    if (result.success) {
      setEmail(username + getDomainSuffix())
      setRegistrationStep("verification")
    } else {
      setError(result.message)
    }
  }

  return (
    <motion.div
      key="register"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-3">
        {/* Registration Form */}
        <div className="space-y-3">
          <Input 
            placeholder="First Name" 
            className="bg-white h-8 text-sm placeholder:text-gray-400 text-black"
            value={userInfo.firstName}
            onChange={(e) => setUserInfo({...userInfo, firstName: e.target.value})}
          />
          <Input 
            placeholder="Last Name" 
            className="bg-white h-8 text-sm placeholder:text-gray-400 text-black"
            value={userInfo.lastName}
            onChange={(e) => setUserInfo({...userInfo, lastName: e.target.value})}
          />
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
          <Input 
            placeholder="GIU ID" 
            className="bg-white h-8 text-sm placeholder:text-gray-400 text-black"
            value={userInfo.giuId}
            onChange={(e) => {
              const value = e.target.value
              if (/^\d*$/.test(value) && value.length <= 8) {
                setUserInfo({...userInfo, giuId: value})
              }
            }}
            maxLength={8}
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <Input 
            placeholder="Phone Number" 
            className="bg-white h-8 text-sm placeholder:text-gray-400 text-black"
            value={userInfo.phone}
            onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
          />
          <Input 
            type="password" 
            placeholder="Password" 
            className="bg-white h-8 text-sm placeholder:text-gray-400 text-black"
            value={userInfo.password}
            onChange={(e) => setUserInfo({...userInfo, password: e.target.value})}
          />

          {/* Gender Toggle */}
          <div className="flex items-center justify-between rounded-md bg-white p-1.5 px-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor="gender" className="text-sm">
                Gender
              </Label>
              <div className="flex items-center space-x-2">
                <span className={cn("text-sm", !userInfo.gender ? "text-gray-400" : "text-black")}>Male</span>
                <Switch 
                  id="gender" 
                  checked={userInfo.gender} 
                  onCheckedChange={(checked) => setUserInfo({...userInfo, gender: checked})}
                />
                <span className={cn("text-sm", userInfo.gender ? "text-gray-400" : "text-black")}>Female</span>
              </div>
            </div>
          </div>

          {/* Driver Toggle */}
          <div className="flex items-center justify-between rounded-md bg-white p-1.5 px-3">
            <Label htmlFor="driver-mode" className="text-sm">
              Driver
            </Label>
            <Switch 
              id="driver-mode" 
              checked={isDriver} 
              onCheckedChange={setIsDriver}
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center">
              {error}
            </div>
          )}

          <Button
            className="w-full bg-black text-white hover:bg-gray-800 h-8 text-sm"
            onClick={handleSubmit}
          >
            {isDriver ? "Next" : "Sign up"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
