"use client"

import { Clock, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getUserBookings } from "@/lib/services/booking"
import { format } from "date-fns"
import { getAreas, getMeetingPointName } from "@/lib/services/area"

interface Ride {
  id: string;
  driver_id: string;
  departure_time: string;
  seats_available: number;
  status: string;
  girls_only: boolean;
  to_giu: boolean;
  area_id: string;
}

interface Booking {
  id: string;
  ride_id: string;
  user_id: string;
  price: number;
  status: string;
  successful: boolean;
  ride: Ride;
}

function RideItem({ booking }: { booking: Booking }) {
  const date = new Date(parseInt(booking.ride.departure_time))
  const formattedDate = format(date, 'dd/MM/yyyy, HH:mm')

  return (
    <div className="rounded-lg bg-gray-100 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex flex-col items-center">
            <Clock className="h-5 w-5 text-black" />
          </div>
          <div>
            <div className="font-medium text-black">
              {formattedDate}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-black">
                {booking.ride.to_giu ? `From ${getMeetingPointName(booking.ride.area_id)}` : 'From German International University'}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Circle className="h-4 w-4 fill-orange-500 text-orange-500" />
              <span className="text-black">
                {booking.ride.to_giu ? 'To German International University' : `To ${getMeetingPointName(booking.ride.area_id)}`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="font-medium text-black">EGP {booking.price.toFixed(2)}</div>
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-black"
            disabled={!booking.successful}
          >
            {booking.successful ? 'Reride' : 'Cancelled'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function RidesList() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // First fetch areas to populate the cache
        await getAreas();
        
        // Then fetch bookings
        const data = await getUserBookings()
        //ignore rides that are null or cancelled
        const filteredData = data.filter((booking) => 
          booking.ride !== null && 
          booking.status !== 'CANCELLED'
        )
        console.log(filteredData)
        setBookings(filteredData)
      } catch (error) {
        console.error('Error loading bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-32 text-black">Loading rides...</div>
  }

  if (bookings.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold text-black">My Rides</h2>
        <div className="text-center text-black">No rides found</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold text-black">My Rides</h2>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <RideItem key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  )
}
