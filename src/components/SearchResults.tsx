"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import dynamic from "next/dynamic"
const Image = dynamic(() => import("next/image"), { ssr: false })
import { RiderDetailsDialog } from "@/components/rider-details-dialog"
import { MeetingPointsDialog } from "@/components/meeting-points-dialog"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"

interface MeetingPoint {
  meetingPoint: {
    id: number
    name: string
  }
  price: number
}

interface Ride {
  id: string
  driverId: string
  driverName?: string
  driverCar?: string
  departureTime: string
  girlsOnly: boolean
  seatsAvailable: number
  meetingPoints: MeetingPoint[]
}

// Separate client component for the search results content
function SearchResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const handleBackClick = () => {
    router.push("/find-ride")
  }

  const giuIsFrom = searchParams.get("giuIsFrom")
  const date = searchParams.get("date")
  const [rides, setRides] = useState<Ride[]>([])
  const avatarSrc = "./marker-icon-2x.png"
  const girlsOnly = searchParams.get("girlsOnly")
  const otherLocationId = searchParams.get("otherLocationId")

  const query = `
  query searchRides($toGiu: Boolean, $girlsOnly: Boolean, $areaId: Int, $departureAfter: String) {
    searchRides(toGIU: $toGiu, girlsOnly: $girlsOnly, areaId: $areaId, departureAfter: $departureAfter) {
      id
      driverId
      departureTime
      girlsOnly
      seatsAvailable
      meetingPoints {
        meetingPoint {
          id
          name
        }
        price
      }
    }
  }
  `

  useEffect(() => {
    const getRides = async () => {
      try {
        const response = await fetch("https://3.239.254.154/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            variables: {
              toGIU: giuIsFrom === "true",
              girlsOnly: girlsOnly === "true",
              areaId: otherLocationId ? Number.parseInt(otherLocationId) : null,
              departureAfter: date,
            },
          }),
        })

        const data = await response.json()

        const rides = data?.data?.searchRides || [];

        const enrichedRides: Promise<Ride>[] = rides.map(async (ride: Ride) => {
          const driverRes = await fetch(`https://3.84.209.34/graphql`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `query getDriverById($id: ID!) {
                  getDriverById(id: $id) {
                    firstName
                    lastName
                    driver{
                      car {
                        vehicleName
                      }
                    }
                  }
                }`,
              variables: {
                id: Number.parseInt(ride.driverId),
              },
            }),
          })

          const driverDetailsData = await driverRes.json()

          const data = driverDetailsData?.data?.getDriverById

          const driverCar = data.driver?.car?.vehicleName

          const driverName = data.firstName + " " + data.lastName

          return {
            ...ride,
            driverName,
            driverCar,
          }
        })

        setRides(await Promise.all(enrichedRides))
      } catch (error) {
        console.error("Error fetching rides:", error)
        toast({
          title: "Error",
          description: "Failed to fetch rides. Please try again.",
          variant: "destructive",
        })
      }
    }

    getRides()
  }, [date, girlsOnly, giuIsFrom, otherLocationId])

  const formatDate = (date: string) => {
    const dateObj = new Date(date)
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")} ${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`
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
          <p className="ml-4">Date: {date ? new Date(date).toLocaleDateString() : "Not specified"}</p>
          <p className="ml-4">Girls-Only Ride: {girlsOnly === "true" ? "Yes" : "No"}</p>
        </div>
      </div>

      <div className="space-y-4">
        {rides.length > 0 ? (
          rides.map((ride) => (
            <RideCard
              key={ride.id}
              id={ride.id}
              driverId={ride.driverId}
              name={ride.driverName || "Driver Name"}
              car={ride.driverCar || "Car Model"}
              departureTime={formatDate(ride.departureTime)}
              availableSeats={ride.seatsAvailable}
              avatarSrc={avatarSrc}
              meetingPoints={ride.meetingPoints}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No rides found matching your criteria.</p>
            <Button onClick={handleBackClick} className="mt-4 bg-orange-400 hover:bg-orange-500 text-white">
              Modify Search
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading search results...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  )
}

interface RideCardProps {
  id: string
  name: string
  car: string
  departureTime: string
  driverId: string
  availableSeats: number
  avatarSrc: string
  meetingPoints: MeetingPoint[]
}

function RideCard({ id, name, car, departureTime, availableSeats, avatarSrc, meetingPoints, driverId }: RideCardProps) {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [meetingPointsDialogOpen, setMeetingPointsDialogOpen] = useState(false)
  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState<MeetingPoint | null>(null)

  const query = `mutation CreateBooking($rideId: Int!, $meetingPointId: Int!) {
                    createBooking(ride_id: $rideId, meeting_point_id: $meetingPointId) {
                        id
                        status
                }
              }`

  const handleJoinRide = async (meetingPoint: MeetingPoint) => {
    setSelectedMeetingPoint(meetingPoint);
    const response = await fetch("https://54.211.248.22/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          rideId: Number.parseInt(id),
          meetingPointId: Number.parseInt(meetingPoint.meetingPoint.id.toString()),
        },
      }),
    });

    const data = await response.json();

    const bookingId = data.data.createBooking.id;

    // Show modal to inform the user about redirection
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "1000";
    modal.style.color = "white";
    modal.style.fontSize = "1.5rem";
    modal.style.textAlign = "center";
    modal.innerHTML = "<div>Redirecting in <span id='countdown'>3</span> seconds...</div>";
    document.body.appendChild(modal);

    let countdown = 3;
    const interval = setInterval(() => {
      countdown -= 1;
      const countdownElement = document.getElementById("countdown");
      if (countdownElement) {
        countdownElement.textContent = countdown.toString();
      }
      if (countdown === 0) {
        clearInterval(interval);
        modal.remove();

        // Fetch the payment URL after 3 seconds
        fetch(`https://100.27.16.234/${bookingId}/payment-url/`, {
          method: "GET"
        })
          .then((paymentUrlResponse) => paymentUrlResponse.json())
          .then((paymentData) => {
            console.log("Payment URL:", paymentData.checkoutUrl);

            if (paymentData.checkoutUrl) {
              window.location.href = paymentData.checkoutUrl;
            }
          });
      }
    }, 1000);

    // toast({
    //   title: "Ride Joined Successfully!",
    //   description: `You've joined the ride with meeting point: ${meetingPoint.meetingPoint.name} (${meetingPoint.price} EGP)`,
    //   className: "bg-green-50 border-green-200 text-green-800",
    // });
  };

  return (
    <Card className="overflow-hidden border">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-amber-100">
            {typeof window !== "undefined" && (
              <Image src={avatarSrc || "/placeholder.svg"} alt={name} width={80} height={80} className="object-cover" />
            )}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">Car: {car}</p>
          <p className="text-sm text-muted-foreground">Departure Time: {departureTime}</p>
          <p className="text-sm text-muted-foreground">Available Seats: {availableSeats}</p>

          {selectedMeetingPoint && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
              <p className="font-medium">Meeting Point: {selectedMeetingPoint.meetingPoint.name}</p>
              <p>Price: {selectedMeetingPoint.price} EGP</p>
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              size="sm"
              onClick={() => setDetailsDialogOpen(true)}
            >
              Rider Details
            </Button>

            <Button
              className={`bg-amber-500 hover:bg-amber-600 text-white ${selectedMeetingPoint ? "opacity-50" : ""}`}
              size="sm"
              onClick={() => setMeetingPointsDialogOpen(true)}
              disabled={!!selectedMeetingPoint}
            >
              {selectedMeetingPoint ? "Booked" : "Join Ride"}
            </Button>
          </div>

          <RiderDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            driverId={driverId}
            driverName={name}
            driverAvatar={avatarSrc}
          />

          <MeetingPointsDialog
            open={meetingPointsDialogOpen}
            onOpenChange={setMeetingPointsDialogOpen}
            meetingPoints={meetingPoints}
            onConfirm={handleJoinRide}
            rideId={id}
          />
        </div>
      </CardContent>
    </Card>
  )
}
