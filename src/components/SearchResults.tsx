"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronLeft, MapPin, Users, Car } from "lucide-react"
import dynamic from "next/dynamic"
const Image = dynamic(() => import("next/image"), { ssr: false })
import { RiderDetailsDialog } from "@/components/rider-details-dialog"
import { MeetingPointsDialog } from "@/components/meeting-points-dialog"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"
import { format } from "date-fns"

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
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
      }
    }

    getRides()
  }, [date, girlsOnly, giuIsFrom, otherLocationId])

  const formatDate = (date: string) => {
    const dateObj = new Date(date)
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")} ${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`
  }

  return (
    <div className="flex-1 p-6 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" size="icon" onClick={handleBackClick} className="h-10 w-10 text-[#F28C28] mr-3 hover:bg-orange-50">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Available Rides</h1>
      </div>

      <div className="mb-8 bg-white shadow-md rounded-xl p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Search Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <span className="text-sm font-medium text-gray-700">Date:</span>
              <span className="ml-2 text-sm">{date ? format(new Date(date), 'dd/MM/yyyy') : "Not specified"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-sm font-medium text-gray-700">Girls-Only Ride:</span>
              <span className="ml-2 text-sm">{girlsOnly === "true" ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 bg-white shadow-md rounded-xl border border-gray-100">
            <div className="mb-4 text-[#F28C28]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            </div>
            <p className="text-gray-600 mb-4">Loading rides...</p>
          </div>
        ) : rides.length > 0 ? (
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
          <div className="text-center py-12 bg-white shadow-md rounded-xl border border-gray-100">
            <div className="mb-4 text-[#F28C28]">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-600 mb-4">No rides found matching your criteria.</p>
            <Button onClick={handleBackClick} className="mt-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-md font-medium">
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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [meetingPointsDialogOpen, setMeetingPointsDialogOpen] = useState(false);
  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState<MeetingPoint | null>(null);
  const router = useRouter();

  const handleViewRideDetails = () => {
    router.push(`/find-ride/${id}`);
  };

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
        fetch(`http://100.27.16.234:4002/${bookingId}/payment-url/`, {
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
    <Card className="overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all cursor-pointer bg-white" onClick={handleViewRideDetails}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Driver info section */}
          <div className="p-6 md:w-1/3 bg-orange-50 border-r border-orange-100 flex flex-col items-center justify-center">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 border-4 border-white shadow-md">
                
                  <Car className="h-full w-full text-[#F28C28] p-4" />
                
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-1">{name}</h3>
            <p className="text-sm text-gray-600 text-center mb-3">{car}</p>
            <div className="flex items-center justify-center gap-1">
              <div className="px-3 py-1 bg-amber-100 rounded-full text-amber-800 text-xs font-medium">
                {availableSeats} {availableSeats === 1 ? 'seat' : 'seats'} available
              </div>
            </div>
          </div>
          
          {/* Ride details section */}
          <div className="p-6 md:w-2/3 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Departure Time</p>
                  <p className="text-base">{departureTime}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#F28C28] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Meeting Points</p>
                  <p className="text-base">{meetingPoints.length} available</p>
                </div>
              </div>
              
              {selectedMeetingPoint && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                  <p className="font-medium">Selected: {selectedMeetingPoint.meetingPoint.name}</p>
                  <p>Price: {selectedMeetingPoint.price} EGP</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewRideDetails();
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

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
    </Card>
  )
}
