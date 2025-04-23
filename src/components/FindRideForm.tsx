"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function FindRideForm() {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    dateTime: "Today, 5:30 PM",
    seats: {
      frontSeat: false,
      backLeft: false,
      backRight: false,
      backMiddle: false,
    },
    girlsOnly: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSeatChange = (seat: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      seats: {
        ...prev.seats,
        [seat]: checked,
      },
    }))
  }

  const handleGirlsOnlyChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, girlsOnly: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission logic here
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-4xl font-bold mb-5">Find a ride</h1>
          <p className="text-gray-600 mb-5 text-lg">Where are you going?</p>

          <div className="space-y-4">
            <div>
              <Input
                name="from"
                placeholder="From"
                value={formData.from}
                onChange={handleInputChange}
                className="bg-gray-50 text-base py-3"
              />
            </div>
            <div>
              <Input
                name="to"
                placeholder="To"
                value={formData.to}
                onChange={handleInputChange}
                className="bg-gray-50 text-base py-3"
              />
            </div>
          </div>

          <div className="mt-14">
            <h2 className="text-3xl font-bold mb-5">
              Pick a Date
              <br />
              and Time?
            </h2>
            <Input
              name="dateTime"
              value={formData.dateTime}
              onChange={handleInputChange}
              className="bg-gray-50 text-base py-3"
            />
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold mb-5">Choose your seat ?</h2>
          <p className="text-gray-600 mb-5 text-lg">Which seat would you prefer?</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="frontSeat" className="font-normal text-base">
                Front Seat
              </Label>
              <Checkbox
                id="frontSeat"
                checked={formData.seats.frontSeat}
                onCheckedChange={(checked) => handleSeatChange("frontSeat", checked as boolean)}
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="backLeft" className="font-normal text-base">
                Back Left
              </Label>
              <Checkbox
                id="backLeft"
                checked={formData.seats.backLeft}
                onCheckedChange={(checked) => handleSeatChange("backLeft", checked as boolean)}
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="backRight" className="font-normal text-base">
                Back Right
              </Label>
              <Checkbox
                id="backRight"
                checked={formData.seats.backRight}
                onCheckedChange={(checked) => handleSeatChange("backRight", checked as boolean)}
                className="h-5 w-5"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="backMiddle" className="font-normal text-base">
                Back Middle
              </Label>
              <Checkbox
                id="backMiddle"
                checked={formData.seats.backMiddle}
                onCheckedChange={(checked) => handleSeatChange("backMiddle", checked as boolean)}
                className="h-5 w-5"
              />
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <Label htmlFor="girlsOnly" className="font-medium text-base">
              Girls-Only Ride
            </Label>
            <Switch
              id="girlsOnly"
              checked={formData.girlsOnly}
              onCheckedChange={handleGirlsOnlyChange}
              className="data-[state=checked]:bg-orange-500 h-7 w-14"
            />
          </div>
        </div>
      </div>

      <div className="mt-14 flex justify-center">
        <Button
          type="submit"
          className="bg-orange-400 hover:bg-orange-500 text-white px-14 py-7 rounded-full text-xl font-medium"
        >
          Search
        </Button>
      </div>
    </form>
  )
}
