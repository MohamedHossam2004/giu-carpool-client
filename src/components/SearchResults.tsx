"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Image from "next/image"
import { RiderDetailsDialog } from "@/components/rider-details-dialog"

export default function ResultsPage() {
  const router = useRouter()

  const handleBackClick = () => {
    router.push("/find-ride")
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <Button variant="ghost" size="icon" onClick={handleBackClick} className="h-10 w-10 text-amber-500">
          <ChevronLeft className="h-8 w-8" />
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Result</h1>
        <div className="text-sm text-muted-foreground mt-1">
          <p>Filter:</p>
          <p className="ml-4">Date: 24/02/2025</p>
          <p className="ml-4">Girls-Only Ride: No</p>
        </div>
      </div>

      <div className="space-y-4">
        <RideCard
          id="1"
          name="Jana Hagar"
          car="Nissan Sunny"
          departureTime="3:15 P.M"
          arrivalTime="5:00 P.M"
          avatarSrc="/placeholder.svg?height=80&width=80"
        />

        <RideCard
          id="2"
          name="Mariam Ahmed"
          car="Kia Citroën"
          departureTime="9:15 P.M"
          arrivalTime="10:00 P.M"
          avatarSrc="/placeholder.svg?height=80&width=80"
        />

        <RideCard
          id="3"
          name="Ahmed Amr"
          car="Fiat Tipo"
          departureTime="1:30 P.M"
          arrivalTime="3:30 P.M"
          avatarSrc="/placeholder.svg?height=80&width=80"
        />
      </div>
    </div>
  )
}

interface RideCardProps {
  id: string
  name: string
  car: string
  departureTime: string
  arrivalTime: string
  avatarSrc: string
}

function RideCard({ id, name, car, departureTime, arrivalTime, avatarSrc }: RideCardProps) {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  return (
    <Card className="overflow-hidden border">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-amber-100">
            <Image src={avatarSrc || "/placeholder.svg"} alt={name} width={80} height={80} className="object-cover" />
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
            onClick={() => setDetailsDialogOpen(true)}
          >
            Rider Details
          </Button>

          <RiderDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            driverId={id}
            driverName={name}
            driverAvatar={avatarSrc}
          />
        </div>
      </CardContent>
    </Card>
  )
}
