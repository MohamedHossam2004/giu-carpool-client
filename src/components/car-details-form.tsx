"use client"

import { motion } from "framer-motion"
import { Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { uploadFile } from "@/lib/upload"

interface CarDetailsFormProps {
  email: string
  password: string
  firstName: string
  lastName: string
  giuId: string
  phone: string
  gender: boolean
  setRegistrationStep: (value: "personal" | "car" | "verification") => void
  setLicenseFile: (file: File | null) => void
}

export default function CarDetailsForm({ 
  email, 
  password, 
  firstName, 
  lastName, 
  giuId, 
  phone, 
  gender,
  setRegistrationStep,
  setLicenseFile
}: CarDetailsFormProps) {
  const [licensePlate, setLicensePlate] = useState("")
  const [year, setYear] = useState("")
  const [vehicleName, setVehicleName] = useState("")
  const [passengerSeats, setPassengerSeats] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const { register } = useAuth()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async () => {
    setError("")
    
    // Validate required fields
    if (!licensePlate || !year || !vehicleName || !passengerSeats || !selectedFile) {
      setError("All fields are required")
      return
    }

    // Validate year is a number and reasonable
    const yearNum = parseInt(year)
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setError("Please enter a valid year")
      return
    }

    // Validate passenger seats is a number and reasonable
    const seatsNum = parseInt(passengerSeats)
    if (isNaN(seatsNum) || seatsNum < 1 || seatsNum > 50) {
      setError("Please enter a valid number of seats")
      return
    }

    try {
      // Store the file for later upload
      setLicenseFile(selectedFile)

      const result = await register({
        email,
        password,
        firstName,
        lastName,
        giuId,
        phone,
        gender,
        isDriver: true,
        carDetails: {
          licensePlate,
          year: yearNum,
          vehicleName,
          passengerSeats: seatsNum,
          licensePicture: selectedFile.name // Store filename temporarily
        }
      })

      if (result.success) {
        setRegistrationStep("verification")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Failed to complete registration")
    }
  }

  return (
    <motion.div
      key="car-details"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-3">
        {/* Car Details Form */}
        <div className="space-y-3">
          <Input 
            placeholder="License Plate" 
            className="bg-white h-8 text-sm placeholder:text-gray-400 text-black"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
          />
          <Input 
            placeholder="Year" 
            className="bg-white h-8 text-sm placeholder:text-gray-400 text-black"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <Input 
            placeholder="Vehicle Name" 
            className="bg-white h-8 text-sm placeholder:text-gray-400 text-black"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
          />
          <Input 
            placeholder="Number of Passenger Seats" 
            className="bg-white h-8 text-sm placeholder:text-gray-400 text-black"
            value={passengerSeats}
            onChange={(e) => setPassengerSeats(e.target.value)}
          />

          {/* License Upload */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500">Driver's License</div>
            <div className="relative flex min-h-24 flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-white p-3">
              <Upload className="mb-1 h-6 w-6 text-gray-400" />
              <div className="text-center text-xs text-gray-500">
                {selectedFile ? selectedFile.name : "Click or drag file to this area to upload"}
              </div>
              <input 
                type="file" 
                className="absolute inset-0 cursor-pointer opacity-0 w-full h-full" 
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 h-8 text-sm bg-gray-100 text-gray-500 hover:bg-gray-200" 
              onClick={() => setRegistrationStep("personal")}
            >
              Back
            </Button>
            <Button 
              className="flex-1 bg-black text-white hover:bg-gray-800 h-8 text-sm"
              onClick={handleSubmit}
            >
              Complete Registration
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
