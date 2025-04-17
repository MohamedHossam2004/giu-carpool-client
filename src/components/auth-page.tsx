"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import LoginForm from "@/components/login-form"
import RegisterForm from "@/components/register-form"
import CarDetailsForm from "@/components/car-details-form"

export default function AuthPage() {
  const [userType, setUserType] = useState<"student" | "alumni">("student")
  const [isDriver, setIsDriver] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [registrationStep, setRegistrationStep] = useState<"personal" | "car">("personal")
  const [username, setUsername] = useState("")

  // Reset driver toggle when switching between login and register
  useEffect(() => {
    if (authMode === "login") {
      setIsDriver(false)
      setRegistrationStep("personal")
    }
  }, [authMode])

  const getDomainSuffix = () => {
    return userType === "student" ? "@student.giu-uni.de" : "@giu-uni.de"
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left side - Map */}
      <div className="relative hidden w-3/5 md:block">
        <Image src="/map.png" alt="GIU Campus Map" fill className="object-cover" priority />
      </div>

      {/* Right side - Auth forms */}
      <div className="flex w-full flex-col items-center justify-between bg-[#f8b678] px-6 py-4 md:w-2/5">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-3 flex flex-col items-center">
            <div className="mb-2">
              <Image src="/logo.png" alt="GIU Logo" width={180} height={65} priority />
            </div>
            <h1 className="text-lg font-semibold text-gray-700">GIU Car Pooling App</h1>
          </div>

          {/* Auth Content */}
          <div className="space-y-2">
            {/* Title */}
            <div className="text-center text-sm text-gray-600 mb-1">
              {authMode === "login"
                ? "Enter your credentials below to sign in"
                : registrationStep === "personal"
                  ? "Enter your credentials below to Sign up"
                  : "Enter your car details"}
            </div>

            {/* User Type Toggle */}
            {(authMode === "login" || (authMode === "register" && registrationStep === "personal")) && (
              <div className="flex items-center justify-center space-x-8 py-0.5">
                <div className="flex items-center space-x-2">
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      userType === "student" ? "border-2 border-black bg-black" : "border-gray-400",
                    )}
                    onClick={() => setUserType("student")}
                  >
                    {userType === "student" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <Label htmlFor="student" className="cursor-pointer text-sm" onClick={() => setUserType("student")}>
                    Student
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border",
                      userType === "alumni" ? "border-2 border-black bg-black" : "border-gray-400",
                    )}
                    onClick={() => setUserType("alumni")}
                  >
                    {userType === "alumni" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <Label htmlFor="alumni" className="cursor-pointer text-sm" onClick={() => setUserType("alumni")}>
                    Alumni
                  </Label>
                </div>
              </div>
            )}

            {/* Forms */}
            <AnimatePresence mode="wait">
              {authMode === "login" ? (
                <LoginForm username={username} setUsername={setUsername} getDomainSuffix={getDomainSuffix} />
              ) : registrationStep === "personal" ? (
                <RegisterForm
                  username={username}
                  setUsername={setUsername}
                  getDomainSuffix={getDomainSuffix}
                  isDriver={isDriver}
                  setIsDriver={setIsDriver}
                  setRegistrationStep={setRegistrationStep}
                />
              ) : (
                <CarDetailsForm setRegistrationStep={setRegistrationStep} />
              )}
            </AnimatePresence>

            {/* Terms and Privacy */}
            <div className="text-center text-xs text-gray-600 pt-1">
              By clicking continue, you agree to our{" "}
              <Link href="#" className="font-medium text-black underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-medium text-black underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Login/Register Toggle - Fixed at bottom */}
        <div className="flex justify-center w-full mt-3">
          <div className="inline-flex rounded-md bg-white p-1 shadow-sm">
            <button
              className={cn(
                "rounded px-4 py-1 text-xs transition-all",
                authMode === "login" ? "bg-[#f8b678] font-medium shadow-sm" : "text-gray-600",
              )}
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
            <button
              className={cn(
                "rounded px-4 py-1 text-xs transition-all",
                authMode === "register" ? "bg-[#f8b678] font-medium shadow-sm" : "text-gray-600",
              )}
              onClick={() => setAuthMode("register")}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
