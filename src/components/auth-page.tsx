"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence } from "framer-motion"
import Cookies from "js-cookie"
import { uploadFile } from "@/lib/upload"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import LoginForm from "@/components/login-form"
import RegisterForm from "@/components/register-form"
import CarDetailsForm from "@/components/car-details-form"
import VerificationForm from "@/components/verification-form"
import { useAuth } from "@/contexts/AuthContext"

export default function AuthPage() {
  const [userType, setUserType] = useState<"student" | "alumni">("student")
  const [isDriver, setIsDriver] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [registrationStep, setRegistrationStep] = useState<"personal" | "car" | "verification">("personal")
  const [username, setUsername] = useState("")
  const [showVerification, setShowVerification] = useState(false)
  const [email, setEmail] = useState("")
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [userInfo, setUserInfo] = useState({
    password: "",
    firstName: "",
    lastName: "",
    giuId: "",
    phone: "",
    gender: true
  })
  const { verifyLogin, verifyRegistration } = useAuth()

  // Reset states when switching between login and register
  useEffect(() => {
    if (authMode === "login") {
      setIsDriver(false)
      setRegistrationStep("personal")
      setShowVerification(false)
      setUserInfo({
        password: "",
        firstName: "",
        lastName: "",
        giuId: "",
        phone: "",
        gender: true
      })
    }
  }, [authMode])

  const getDomainSuffix = () => {
    return userType === "student" ? "@student.giu-uni.de" : "@giu-uni.de"
  }

  const handleLoginSubmit = async () => {
    const fullEmail = username + getDomainSuffix()
    setEmail(fullEmail)
    setShowVerification(true)
  }

  const handleVerification = async (code: string) => {
    let result
    if (registrationStep === "verification") {
      result = await verifyRegistration(email, code)
      
      // If registration was successful and we have a license file, upload it
      console.log(result, licenseFile)
      if (result.success && licenseFile) {
        try {
          const accessToken = Cookies.get('accessToken')
          console.log(accessToken)
          if (!accessToken) {
            throw new Error('No access token found')
          }
          
          const fileUrl = await uploadFile(licenseFile, accessToken)
          console.log('License uploaded successfully:', fileUrl)
        } catch (error) {
          console.error('Failed to upload license:', error)
        }
      }
    } else {
      result = await verifyLogin(email, code)
    }
    
    if (result.success) {
      window.location.href = "/"
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left side - Map */}
      <div className="relative hidden w-3/5 md:block">
        <Image 
          src="/map.png" 
          alt="Tagamo3 Map" 
          fill 
          className="object-cover" 
          priority={true}
          loading="eager"
          sizes="(max-width: 768px) 100vw, 60vw"
        />
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
              {showVerification || registrationStep === "verification"
                ? "Enter the verification code"
                : authMode === "login"
                ? "Enter your credentials below to sign in"
                : registrationStep === "personal"
                ? "Enter your credentials below to Sign up"
                : "Enter your car details"}
            </div>

            {/* User Type Toggle */}
            {!showVerification && registrationStep !== "verification" && (authMode === "login" || (authMode === "register" && registrationStep === "personal")) && (
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
              {showVerification || registrationStep === "verification" ? (
                <VerificationForm 
                  onVerify={handleVerification}
                  type={showVerification ? "login" : isDriver ? "driver" : "register"}
                />
              ) : authMode === "login" ? (
                <LoginForm 
                  username={username} 
                  setUsername={setUsername} 
                  getDomainSuffix={getDomainSuffix}
                  onSubmit={handleLoginSubmit}
                />
              ) : registrationStep === "personal" ? (
                <RegisterForm
                  username={username}
                  setUsername={setUsername}
                  getDomainSuffix={getDomainSuffix}
                  isDriver={isDriver}
                  setIsDriver={setIsDriver}
                  setRegistrationStep={setRegistrationStep}
                  setEmail={setEmail}
                  userInfo={userInfo}
                  setUserInfo={setUserInfo}
                />
              ) : (
                <CarDetailsForm 
                  email={email}
                  setRegistrationStep={setRegistrationStep}
                  {...userInfo}
                  setLicenseFile={setLicenseFile}
                />
              )}
            </AnimatePresence>

            {/* Terms and Privacy */}
            {!showVerification && registrationStep !== "verification" && (
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
            )}
          </div>
        </div>

        {/* Login/Register Toggle - Fixed at bottom */}
        {!showVerification && registrationStep !== "verification" && (
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
        )}
      </div>
    </div>
  )
}
