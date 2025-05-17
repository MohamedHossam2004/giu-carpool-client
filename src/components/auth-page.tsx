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
        <div className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-end text-white p-8 pb-32">
          <h2 className="text-4xl font-bold mb-6 text-center">University Car Pooling App</h2>
          <p className="text-xl text-center max-w-lg leading-relaxed">
            Welcome to GIU's Carpooling Platform! Connect with fellow students and alumni for convenient, eco-friendly rides to campus.
          </p>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-4 md:w-2/5">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-4">
              <Image src="/logo.png" alt="GIU Logo" width={220} height={82} priority />
            </div>
            <h1 className="text-3xl font-semibold text-foreground">
              {authMode === "login" ? "Welcome to GIU Carpooling" : "Create your account"}
            </h1>
          </div>

          {/* Auth Content */}
          <div className="space-y-3 bg-card rounded-xl p-6 shadow-lg border border-border">
            {/* Title */}
            <div className="text-center text-base font-medium text-muted-foreground mb-3">
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
              <div className="flex items-center justify-center space-x-8 py-1">
                <div className="flex items-center space-x-2">
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2",
                      userType === "student" ? "border-primary bg-primary" : "border-muted",
                    )}
                    onClick={() => setUserType("student")}
                  >
                    {userType === "student" && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                  </div>
                  <Label htmlFor="student" className="cursor-pointer text-sm font-medium" onClick={() => setUserType("student")}>
                    Student
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2",
                      userType === "alumni" ? "border-primary bg-primary" : "border-muted",
                    )}
                    onClick={() => setUserType("alumni")}
                  >
                    {userType === "alumni" && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                  </div>
                  <Label htmlFor="alumni" className="cursor-pointer text-sm font-medium" onClick={() => setUserType("alumni")}>
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
          </div>
        </div>

        {/* Login/Register Toggle - Fixed at bottom */}
        {!showVerification && registrationStep !== "verification" && (
          <div className="flex justify-center w-full mt-4">
            <div className="inline-flex rounded-lg bg-muted p-1.5">
              <button
                className={cn(
                  "rounded-md px-6 py-2 text-sm font-medium transition-all",
                  authMode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
              <button
                className={cn(
                  "rounded-md px-6 py-2 text-sm font-medium transition-all",
                  authMode === "register" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
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
