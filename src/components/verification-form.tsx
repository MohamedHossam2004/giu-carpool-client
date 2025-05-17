"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"

interface VerificationFormProps {
  onVerify: (code: string) => void
  type: "login" | "register" | "driver"
}

export default function VerificationForm({ onVerify, type }: VerificationFormProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = () => {
    const verificationCode = code.join("")
    if (verificationCode.length === 6) {
      console.log(onVerify)
      onVerify(verificationCode)
    }
  }

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  return (
    <motion.div
      key="verification"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-6">
        <div className="text-center text-sm text-gray-600">
          {type === "login" 
            ? "We've sent a verification code to your email. Please enter it below to sign in."
            : type === "register"
            ? "We've sent a verification code to your email. Please enter it below to complete your registration."
            : "We've sent a verification code to your email. Please enter it below to complete your driver registration."}
        </div>
        <div className="flex justify-center space-x-3">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                if (el) inputRefs.current[index] = el
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg bg-white border-gray-200 focus:border-black focus:ring-black"
            />
          ))}
        </div>
        <Button 
          className="w-full bg-black text-white hover:bg-gray-800 h-10 text-sm font-medium"
          onClick={handleSubmit}
        >
          Verify
        </Button>
      </div>
    </motion.div>
  )
} 