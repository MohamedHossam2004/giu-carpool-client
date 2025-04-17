"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface RegisterFormProps {
  username: string
  setUsername: (value: string) => void
  getDomainSuffix: () => string
  isDriver: boolean
  setIsDriver: (value: boolean) => void
  setRegistrationStep: (value: "personal" | "car") => void
}

export default function RegisterForm({
  username,
  setUsername,
  getDomainSuffix,
  isDriver,
  setIsDriver,
  setRegistrationStep,
}: RegisterFormProps) {
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
          <Input placeholder="Name" className="bg-white h-8 text-sm placeholder:text-gray-400 text-black" />
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
          <Input placeholder="GIU ID" className="bg-white h-8 text-sm placeholder:text-gray-400 text-black" />
          <Input placeholder="+201234567890" className="bg-white h-8 text-sm placeholder:text-gray-400 text-black" />
          <Input type="password" placeholder="Password" className="bg-white h-8 text-sm placeholder:text-gray-400 text-black" />
          <Input type="password" placeholder="Repeat Password" className="bg-white h-8 text-sm placeholder:text-gray-400 text-black" />

          {/* Driver Toggle */}
          <div className="flex items-center justify-between rounded-md bg-white p-1.5 px-3">
            <Label htmlFor="driver-mode" className="text-sm">
              Driver
            </Label>
            <Switch id="driver-mode" checked={isDriver} onCheckedChange={setIsDriver} />
          </div>

          <Button
            className="w-full bg-black text-white hover:bg-gray-800 h-8 text-sm"
            onClick={() => {
              if (isDriver) {
                setRegistrationStep("car")
              }
            }}
          >
            {isDriver ? "Next" : "Sign up"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
