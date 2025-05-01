"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import { Button } from "@/components/ui/button"
import 'react-datepicker/dist/react-datepicker.css';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon, Clock, AlertCircle, ChevronUp, ChevronDown, Calendar, LoaderCircle, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link";

// Mock data for locations

export default function FindRideForm() {
  const [giuIsFrom, setGiuIsFrom] = useState(true)
  const [otherLocation, setOtherLocation] = useState("")
  const [formData, setFormData] = useState({
    date: new Date(),
    time: {
      hours: new Date().getHours(),
      minutes: new Date().getMinutes(),
    },
  })
  const [girlsOnly, setGirlsOnly] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [timeOpen, setTimeOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState<any[]>([])

  const router = useRouter();


  useEffect(() => {

    const getLocations = async () => {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query:
            `query getAreas { 
              getAreas {
                id
                name
              }
            }`
        }),
      })

      const data = await response.json()

      const areas = await data.data.getAreas;

      setLocations(areas);
    }

    getLocations();

  }, [])

  useEffect(() => {
    if (!otherLocation) {
      setError("Please select a location")
    } else {
      setError(null)
    }
  }, [otherLocation])

  const handleSearch = async () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 3000)
  }

  const handleOtherLocationChange = (value: string) => {
    setOtherLocation(value)
  }

  const toggleDirection = () => {
    setGiuIsFrom((prev) => !prev)
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date }))
      // Don't close the popover automatically
    }
  }

  const handleTimeChange = (hours: number, minutes: number) => {
    setFormData((prev) => ({
      ...prev,
      time: { hours, minutes },
    }))
    // Don't close the popover automatically
  }

  return (
    <form className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-4xl font-bold mb-5">Find a ride</h1>
          <p className="text-gray-600 mb-5 text-lg">Where are you going?</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label className="block mb-2 text-base">From</Label>
                <div
                  className={cn(
                    "flex items-center px-4 py-3 h-[60px] rounded-md border border-input",
                    giuIsFrom ? "bg-orange-50 border-orange-200" : "bg-gray-50",
                  )}
                >
                  <div className="font-medium text-base">
                    {giuIsFrom ? "GIU Campus" : otherLocation || "Select location"}
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={toggleDirection}
                  className="rounded-full h-10 w-10 flex items-center justify-center border-orange-200 hover:bg-orange-50"
                >
                  <ArrowLeftRight className="h-5 w-5 text-orange-500" />
                </Button>
              </div>

              <div className="flex-1">
                <Label className="block mb-2 text-base">To</Label>
                <div
                  className={cn(
                    "flex items-center px-4 py-3 h-[60px] rounded-md border border-input",
                    !giuIsFrom ? "bg-orange-50 border-orange-200" : "bg-gray-50",
                  )}
                >
                  <div className="font-medium text-base">
                    {!giuIsFrom ? "GIU Campus" : otherLocation || "Select location"}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="otherLocation" className="block mb-2 text-base">
                Other Location
              </Label>
              <Select value={otherLocation} onValueChange={handleOtherLocationChange}>
                <SelectTrigger id="otherLocation" className="w-full bg-gray-50 text-base py-6">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.length > 0 && locations.map((location) => (
                    <SelectItem key={location.id} value={location.name}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-14">
            <h2 className="text-3xl font-bold mb-5">
              Pick a Date
              <br />
              and Time?
            </h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="date" className="block mb-2 text-base">
                  Date
                </Label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-gray-50 text-base py-6 h-auto"
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {format(formData.date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                      <Calendar size={20} />
                      <DatePicker
                        selected={formData.date}
                        onChange={(date) => handleDateChange(date as Date)}
                        dateFormat="yyyy-MM-dd"
                        className="border p-2 rounded"
                      />
                      <div className="mt-4 flex justify-end">
                        <Button onClick={() => setDateOpen(false)}>Done</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="time" className="block mb-2 text-base">
                  Time
                </Label>
                <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="time"
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-gray-50 text-base py-6 h-auto"
                    >
                      <Clock className="mr-2 h-5 w-5" />
                      {format(new Date().setHours(formData.time.hours, formData.time.minutes), "h:mm a")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="flex flex-col space-y-6">
                      <div className="grid grid-cols-3 gap-6 items-center">
                        {/* Hours */}
                        <div className="flex flex-col items-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const newHours = formData.time.hours >= 23 ? 0 : formData.time.hours + 1
                              handleTimeChange(newHours, formData.time.minutes)
                            }}
                            className="rounded-full w-8 h-8"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <div className="h-12 flex items-center justify-center text-xl my-2">
                            {String(formData.time.hours).padStart(2, "0")}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const newHours = formData.time.hours <= 0 ? 23 : formData.time.hours - 1
                              handleTimeChange(newHours, formData.time.minutes)
                            }}
                            className="rounded-full w-8 h-8"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <span className="text-xs mt-1">Hours</span>
                        </div>

                        <div className="text-center text-2xl font-bold">:</div>

                        {/* Minutes */}
                        <div className="flex flex-col items-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const newMinutes = formData.time.minutes >= 59 ? 0 : formData.time.minutes + 1
                              handleTimeChange(formData.time.hours, newMinutes)
                            }}
                            className="rounded-full w-8 h-8"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <div className="h-12 flex items-center justify-center text-xl my-2">
                            {String(formData.time.minutes).padStart(2, "0")}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const newMinutes = formData.time.minutes <= 0 ? 59 : formData.time.minutes - 1
                              handleTimeChange(formData.time.hours, newMinutes)
                            }}
                            className="rounded-full w-8 h-8"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <span className="text-xs mt-1">Minutes</span>
                        </div>
                      </div>

                      {/* AM/PM Toggle */}
                      <div className="flex justify-center">
                        <div className="flex rounded-md overflow-hidden">
                          <Button
                            type="button"
                            variant={formData.time.hours < 12 ? "default" : "outline"}
                            onClick={() => {
                              if (formData.time.hours >= 12) {
                                handleTimeChange(formData.time.hours - 12, formData.time.minutes)
                              }
                            }}
                            className={cn(
                              "rounded-none rounded-l-md",
                              formData.time.hours < 12 ? "bg-orange-400 hover:bg-orange-500" : "",
                            )}
                          >
                            AM
                          </Button>
                          <Button
                            type="button"
                            variant={formData.time.hours >= 12 ? "default" : "outline"}
                            onClick={() => {
                              if (formData.time.hours < 12) {
                                handleTimeChange(formData.time.hours + 12, formData.time.minutes)
                              }
                            }}
                            className={cn(
                              "rounded-none rounded-r-md",
                              formData.time.hours >= 12 ? "bg-orange-400 hover:bg-orange-500" : "",
                            )}
                          >
                            PM
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={() => setTimeOpen(false)}>Done</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold mb-5">Ride preferences</h2>
          <p className="text-gray-600 mb-5 text-lg">Additional options</p>

          <div className="mt-10 flex items-center justify-between">
            <Label htmlFor="girlsOnly" className="font-medium text-base">
              Girls-Only Ride
            </Label>
            <Switch
              id="girlsOnly"
              checked={girlsOnly}
              onCheckedChange={setGirlsOnly}
              className="data-[state=checked]:bg-orange-400"
            />
          </div>
        </div>
      </div>

      <div className="mt-14 flex justify-center">
        {otherLocation ?
          <Link
            href={{ pathname: "/ride-results", query: { ...formData, girlsOnly, locations: JSON.stringify(locations) } as any }}

          >
            <Button
              type="submit"
              className="bg-orange-400 hover:bg-orange-500 text-white px-14 py-7 rounded-full text-xl font-medium"
              disabled={!!error}
              onClick={handleSearch}
            >
              {loading ? (
                <LoaderCircle className="animate-spin" size={20} />
              ) : (
                'Search'
              )}
            </Button>
          </Link>
          :
          <Button
            type="submit"
            className="bg-orange-400 hover:bg-orange-500 text-white px-14 py-7 rounded-full text-xl font-medium"
            disabled={true}
          >
            Search
          </Button>
        }
      </div>
    </form>
  )
}
