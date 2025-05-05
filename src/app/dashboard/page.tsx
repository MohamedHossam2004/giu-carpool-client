"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, gql } from "@apollo/client"
import { ridesClient } from "@/lib/apollo-client"
import { AlertCircle, ArrowRight, Calendar, Clock, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Cookies from 'js-cookie'
import { ME_QUERY } from "@/lib/graphql/queries"
import { format } from "date-fns"

// Ride Status Queries
const GET_USER_RIDES_BY_STATUS = gql`
  query GetUserRidesByStatus($status: RideStatus!) {
    getUserRideByStatus(status: $status) {
        id
    area {
      id
      name
    }
    toGIU
    status
    driverId
    girlsOnly
    departureTime
    seatsAvailable
    meetingPoints {
      id
      price
      meetingPoint {
        name
      }
    }
  }
  }
`

const GET_DRIVER_RIDES_BY_STATUS = gql`
  query GetDriverRidesByStatus($status: RideStatus!) {
    getDriverRideByStatus(status: $status) {
        id
    area {
      id
      name
    }
    toGIU
    status
    driverId
    girlsOnly
    departureTime
    seatsAvailable
    meetingPoints {
      id
      price
      meetingPoint {
        name
      }
    }
  }
  }
`

interface MeetingPoint {
  id: string;
  name: string;
}

interface Pricing {
  id: string;
  price: number;
  meetingPoint: MeetingPoint;
}

interface Area {
  id: string;
  name: string;
}


interface Booking {
  id: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  meetingPoint: {
    name: string;
  };
}

interface Ride {
  id: string;
  departureTime: string;
  seatsAvailable: number;
  status: string;
  girlsOnly: boolean;
  toGIU: boolean;
  area: Area;
  driverId: string;
  meetingPoints: MeetingPoint[];
  bookings?: Booking[];
}

function RideCard({ ride, isDriverView = false }: { ride: Ride; isDriverView?: boolean }) {
  const date = new Date(parseInt(ride.departureTime))
  const formattedDate = format(date, 'dd/MM/yyyy, HH:mm')

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{formattedDate}</span>
          </div>
          <h3 className="text-lg font-semibold text-black">
            {ride.toGIU ? `To GIU from ${ride.area.name}` : `From GIU to ${ride.area.name}`}
          </h3>
        </div>
        <div className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
          {ride.status}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {ride.meetingPoints.length} meeting point{ride.meetingPoints.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {ride.seatsAvailable} seat{ride.seatsAvailable !== 1 ? 's' : ''} available
          </span>
        </div>

        {ride.girlsOnly && (
          <div className="text-sm text-pink-600 font-medium">
            Girls only
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <div>
          <span className="text-sm text-gray-500">Starting from</span>
          <div className="text-lg font-bold text-black">EGP {Math.min(...ride.meetingPoints.map(mp => mp.price)).toFixed(2)}</div>
        </div>

        {isDriverView ? (
          <Button className="bg-blue-600 hover:bg-blue-700">
            View Details
          </Button>
        ) : (
          <Button className="bg-green-600 hover:bg-green-700">
            Book Ride
          </Button>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upcoming" | "active">("upcoming");
  const [isDriverView, setIsDriverView] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = Cookies.get('accessToken');
  const { data: userData, loading: userLoading } = useQuery(ME_QUERY, {
    context: {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }
  });

  // Query for user rides
  const { data: userUpcomingRidesData, loading: userUpcomingLoading } = useQuery(GET_USER_RIDES_BY_STATUS, {
    variables: { status: "PENDING" },
    client: ridesClient,
    context: {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    },
    skip: !accessToken || userLoading || (userData?.me?.isDriver && isDriverView)
  });

  const { data: userActiveRidesData, loading: userActiveLoading } = useQuery(GET_USER_RIDES_BY_STATUS, {
    variables: { status: "IN_PROGRESS" },
    client: ridesClient,
    context: {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    },
    skip: !accessToken || userLoading || (userData?.me?.isDriver && isDriverView)
  });

  // Query for driver rides
  const { data: driverUpcomingRidesData, loading: driverUpcomingLoading } = useQuery(GET_DRIVER_RIDES_BY_STATUS, {
    variables: { status: "PENDING" },
    client: ridesClient,
    context: {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    },
    skip: !accessToken || userLoading || !userData?.me?.isDriver || !isDriverView
  });

  const { data: driverActiveRidesData, loading: driverActiveLoading } = useQuery(GET_DRIVER_RIDES_BY_STATUS, {
    variables: { status: "IN_PROGRESS" },
    client: ridesClient,
    context: {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    },
    skip: !accessToken || userLoading || !userData?.me?.isDriver || !isDriverView
  });

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }
  }, [accessToken, router]);

  const isLoading = userLoading || 
    (isDriverView ? (driverUpcomingLoading || driverActiveLoading) : (userUpcomingLoading || userActiveLoading));

  const upcomingRides = isDriverView 
    ? driverUpcomingRidesData?.getDriverRideByStatus || []
    : userUpcomingRidesData?.getUserRideByStatus || [];

  const activeRides = isDriverView 
    ? driverActiveRidesData?.getDriverRideByStatus || []
    : userActiveRidesData?.getUserRideByStatus || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 rounded-full bg-blue-500 animate-ping" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-black">Dashboard</h1>
              
              {userData?.me?.isDriver && (
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${!isDriverView ? 'bg-white shadow-sm text-black' : 'text-gray-600'}`}
                    onClick={() => setIsDriverView(false)}
                  >
                    Passenger View
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${isDriverView ? 'bg-white shadow-sm text-black' : 'text-gray-600'}`}
                    onClick={() => setIsDriverView(true)}
                  >
                    Driver View
                  </button>
                </div>
              )}
            </div>

            <Tabs defaultValue="upcoming" className="w-full" onValueChange={(value) => setActiveTab(value as "upcoming" | "active")}>
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="upcoming" className="text-base">
                  <Calendar className="h-4 w-4 mr-2" />
                  Upcoming Rides
                </TabsTrigger>
                <TabsTrigger value="active" className="text-base">
                  <Clock className="h-4 w-4 mr-2" />
                  Active Rides
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="mt-0">
                {upcomingRides.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming rides</h3>
                    <p className="text-gray-600 mb-6">You don't have any upcoming rides scheduled.</p>
                    <Button 
                      onClick={() => router.push(isDriverView ? '/ride-creation' : '/find-ride')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isDriverView ? 'Create a Ride' : 'Find a Ride'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingRides.map((ride: Ride) => (
                      <RideCard key={ride.id} ride={ride} isDriverView={isDriverView} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="active" className="mt-0">
                {activeRides.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active rides</h3>
                    <p className="text-gray-600">You don't have any rides in progress.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeRides.map((ride: Ride) => (
                      <RideCard key={ride.id} ride={ride} isDriverView={isDriverView} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{error}</span>
              </div>
            )}
          </div>
  );
}