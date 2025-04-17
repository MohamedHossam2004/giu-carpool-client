"use client"

import { motion } from "framer-motion"
import { Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CarDetailsFormProps {
  setRegistrationStep: (value: "personal" | "car") => void
}

export default function CarDetailsForm({ setRegistrationStep }: CarDetailsFormProps) {
  return (
    <motion.div
      key="car-details"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {/* Car Details Form */}
      <div className="space-y-3">
        <Input placeholder="Vehicle Name" className="bg-white h-8 text-sm placeholder:text-gray-400 text-black" />
        <Input placeholder="Year" className="bg-white h-8 text-sm placeholder:text-gray-400 text-black" />
        <Input placeholder="Plate" className="bg-white h-8 text-sm placeholder:text-gray-400 text-black" />
        <Input placeholder="Seating Capacity" className="bg-white h-8 text-sm placeholder:text-gray-400 text-black" />

        {/* License Upload */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-500">Drivers License</div>
          <div className="relative flex min-h-24 flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-white p-3">
            <Upload className="mb-1 h-6 w-6 text-gray-400" />
            <div className="text-center text-xs text-gray-500">Click or drag file to this area to upload</div>
            <input 
              type="file" 
              className="absolute inset-0 cursor-pointer opacity-0 w-full h-full" 
              accept="image/*,.pdf"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-8 text-sm bg-gray-100 text-gray-500 hover:bg-gray-200" onClick={() => setRegistrationStep("personal")}>
            Cancel
          </Button>
          <Button className="flex-1 bg-black text-white hover:bg-gray-800 h-8 text-sm">Continue</Button>
        </div>
      </div>
    </motion.div>
  )
}
