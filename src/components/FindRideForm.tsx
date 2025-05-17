"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { toast } from "./ui/use-toast";
import Cookies from "js-cookie";

export default function FindRideForm() {
  const [giuIsFrom, setGiuIsFrom] = useState(true)
  const [otherLocation, setOtherLocation] = useState("")
  const [formData, setFormData] = useState({
    date: new Date(), // Initial dummy value, will be updated in useEffect
  })
  const [girlsOnly, setGirlsOnly] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState<any[]>([])
  const [otherLocationId, setOtherLocationId] = useState<number | null>(null)
  const [gender, setGender] = useState<boolean | null>(null)
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Set initial date only on the client side after mount
    const now = new Date();
    setFormData({
      date: now,
    });

    const getLocations = async () => {

      try {
        const response = await fetch("https://3.239.254.154/graphql", {
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

        const ME_QUERY = `
                          query Me {
                              me {
                                id
                                gender
                              }
                          }
                        `;

        const profile = await fetch("https://3.84.209.34/graphql", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get("accessToken")}`,
          },
          body: JSON.stringify({ query: ME_QUERY }),
        })

        const profileData = await profile.json()

        setGender(profileData.data.me.gender)


      } catch (error) {
        console.error("Error fetching Areas:", error)
        toast({
          title: "Error",
          description: "Failed to fetch Areas. Please try again.",
          variant: "destructive",
        })
      }
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
    setOtherLocationId(locations.find((location) => location.name === value)?.id)
  }

  const toggleDirection = () => {
    setGiuIsFrom((prev) => !prev)
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date }))
    }
  }

  const formatFormData = () => {
    return new Date(formData.date).toISOString();
  }

  return (
      <form className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h1 className="text-4xl font-bold mb-5 text-gray-900">Find a ride</h1>
              <p className="text-gray-600 mb-8 text-lg">Where are you going?</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-5 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1 w-full">
                    <Label className="block mb-2 text-base font-medium text-gray-700">From</Label>
                    <div
                      className={cn(
                        "flex items-center px-4 py-3 h-[60px] rounded-md border shadow-sm transition-all",
                        giuIsFrom ? "bg-orange-50 border-orange-300 shadow-orange-100" : "bg-gray-50 hover:border-gray-300",
                      )}
                    >
                      <div className="font-medium text-base">
                        {giuIsFrom ? "GIU Campus" : otherLocation || "Select location"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-0 md:pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={toggleDirection}
                      className="rounded-full h-12 w-12 flex items-center justify-center border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all shadow-sm"
                    >
                      <ArrowLeftRight className="h-5 w-5 text-orange-500" />
                    </Button>
                  </div>

                  <div className="flex-1 w-full">
                    <Label className="block mb-2 text-base font-medium text-gray-700">To</Label>
                    <div
                      className={cn(
                        "flex items-center px-4 py-3 h-[60px] rounded-md border shadow-sm transition-all",
                        !giuIsFrom ? "bg-orange-50 border-orange-300 shadow-orange-100" : "bg-gray-50 hover:border-gray-300",
                      )}
                    >
                      <div className="font-medium text-base">
                        {!giuIsFrom ? "GIU Campus" : otherLocation || "Select location"}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="otherLocation" className="block mb-2 text-base font-medium text-gray-700">
                    Other Location
                  </Label>
                  <Select value={otherLocation} onValueChange={handleOtherLocationChange}>
                    <SelectTrigger id="otherLocation" className="w-full bg-gray-50 text-base py-6 border shadow-sm hover:border-gray-300 transition-all">
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

              <div className="mt-10">
                <h2 className="text-3xl font-bold mb-5">
                  Pick a Date
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
                      <PopoverContent className="w-auto p-4" align="start">
                        <div className="flex flex-col space-y-4">
                          <Calendar size={20} />
                          <DatePicker
                            selected={formData.date}
                            onChange={(date) => handleDateChange(date as Date)}
                            dateFormat="yyyy-MM-dd"
                            className="border p-2 rounded"
                          />
                          <div className="mt-6 flex justify-center">
                            <Button onClick={() => setDateOpen(false)}>Done</Button>
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
              <p className="text-gray-600 mb-6 text-lg">Additional options</p>

              <div className="mt-8 flex items-center justify-between">
                <Label htmlFor="girlsOnly" className="font-medium text-base">
                  Girls-Only Ride
                </Label>
                <Switch
                  id="girlsOnly"
                  checked={girlsOnly}
                  onCheckedChange={setGirlsOnly}
                  disabled={gender ? gender : false}
                  className="data-[state=checked]:bg-orange-400"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            {otherLocation ?
              <Link
                href={{ pathname: "/ride-results", query: { date: formatFormData(), girlsOnly, otherLocation, otherLocationId, giuIsFrom } }}

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
          </div>
      </form>
  );
}
