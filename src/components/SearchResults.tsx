"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import dynamic from "next/dynamic"
const Image = dynamic(() => import("next/image"), { ssr: false })
import { useState, useEffect } from "react"
import { SeatsDialog } from "./seats-dialog"
import { toast } from "./ui/use-toast"

export default function SearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [girlsOnly, setGirlsOnly] = useState(false)

  useEffect(() => {
    const girlsOnlyParam = searchParams.get('girlsOnly')
    if (girlsOnlyParam !== null) {
      setGirlsOnly(girlsOnlyParam === 'true')
    }
  }, [searchParams])

  const handleBackClick = () => {
    router.push("/find-ride")
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <Button variant="ghost" size="icon" onClick={handleBackClick} className="h-10 w-10 text-amber-500">
          <ChevronLeft className="h-20 w-20" />
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Result</h1>
        <div className="text-sm text-muted-foreground mt-1">
          <p>Filter:</p>
          <p className="ml-4">Date: 24/02/2025</p>
          <p className="ml-4">Girls-Only Ride: {girlsOnly ? "Yes" : "No"}</p>
        </div>
      </div>

      <div className="space-y-4">
        <RideCard
          name="Jana Hagar"
          car="Nissan Sunny"
          departureTime="3:15 P.M"
          arrivalTime="5:00 P.M"
          avatarSrc=""
        />

        <RideCard
          name="Mariam Ahmed"
          car="Kia Citroën"
          departureTime="9:15 P.M"
          arrivalTime="10:00 P.M"
          avatarSrc=""
        />

        <RideCard
          name="Ahmed Amr"
          car="Fiat Tipo"
          departureTime="1:30 P.M"
          arrivalTime="3:30 P.M"
          avatarSrc=""
        />
      </div>
    </div>
  )
}

interface RideCardProps {
  name: string
  car: string
  departureTime: string
  arrivalTime: string
  avatarSrc: string
}

export function RideCard({ name, car, departureTime, arrivalTime, avatarSrc }: RideCardProps) {
  const [seatsDialogOpen, setSeatsDialogOpen] = useState(false)

  const handleSeatsConfirm = (selectedSeats: any[]) => {
    if (selectedSeats.length > 0) {
      toast({
        title: "Seats selected",
        description: `You selected ${selectedSeats.length} seat(s) for ${name}'s ride.`,
      })
    }
  }

  return (
    <Card className="overflow-hidden border">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-amber-100">
            {typeof window !== 'undefined' && (
              <Image src={avatarSrc || "/placeholder.svg"} alt={name} width={80} height={80} className="object-cover" />
            )}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">Car: {car}</p>
          <p className="text-sm text-muted-foreground">Departure Time: {departureTime}</p>
          <p className="text-sm text-muted-foreground">Estimated Arrival Time: {arrivalTime}</p>

          <Button
            className="mt-2 bg-amber-500 hover:bg-amber-600 text-white"
            size="sm"
            onClick={() => setSeatsDialogOpen(true)}
          >
            Show available seats
          </Button>

          <SeatsDialog open={seatsDialogOpen} onOpenChange={setSeatsDialogOpen} onConfirm={handleSeatsConfirm} />
        </div>
      </CardContent>
    </Card>
  )
}
