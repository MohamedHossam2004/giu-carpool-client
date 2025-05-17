'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useLazyQuery, gql } from "@apollo/client";
import { ridesClient } from "@/lib/apollo-client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Cookies from 'js-cookie';
import { ME_QUERY } from "@/lib/graphql/queries";
import { format } from "date-fns";
import Link from "next/link";
import { AlertCircle, Calendar, ArrowRight, Clock } from "lucide-react";

// GraphQL Query for Passenger's Rides
const GET_USER_RIDES_BY_STATUS = gql`
  query GetUserRideByStatus($status: RideStatus!) {
    getUserRideByStatus(status: $status) {
      id
      status
      driverId
      girlsOnly
      toGIU
      departureTime
      seatsAvailable
      area {
        id
        name
        isActive
      }
      meetingPoints {
        id
        price
        orderIndex
        meetingPoint {
          id
          name
          latitude
          longitude
          isActive
        }
      }
      passengers {
        id
        passengerId
        passengerName
        createdAt
      }
      reviews {
        id
        rating
        review
        createdAt
      }
    }
  }
`;

// GraphQL Query for Driver's Rides
const GET_DRIVER_RIDES_BY_STATUS = gql`
  query GetDriverRideByStatus($status: RideStatus!) {
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
`;

interface Ride {
  id: string;
  departureTime: string;
  seatsAvailable: number;
  status: string;
  girlsOnly: boolean;
  toGIU: boolean;
  area: { name: string };
  meetingPoints: { price: number; meetingPoint: { name: string } }[];
  passengers: { passengerName: string }[];
}

function RideCard({ ride, isDriverView = false }: { ride: Ride; isDriverView?: boolean }) {
  const date = new Date(ride.departureTime);
  const formattedDate = format(date, 'dd/MM/yyyy, HH:mm');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-600">{formattedDate}</span>
          </div>
          <h3 className="text-lg font-semibold text-black">
            {ride.toGIU ? `To GIU from ${ride.area.name}` : `From GIU to ${ride.area.name}`}
          </h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${ride.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-600' : ride.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
          {ride.status}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            {ride.meetingPoints.length} meeting point{ride.meetingPoints.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
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

        <Link href={isDriverView ? `/dashboard/${ride.id}` : `/dashboard/passenger/${ride.id}`}>
          <Button className="bg-[#F28C28] hover:bg-[#e57c1d] text-white transition-all duration-300">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upcoming" | "active">("upcoming");
  const [error, setError] = useState<string | null>(null);

  const accessToken = Cookies.get('accessToken');
  const { data: userData, loading: userLoading } = useQuery(ME_QUERY, {
    context: {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }
  });
  const isDriver = userData?.me?.isDriver;

  const [fetchPassengerUpcomingRides, { data: passengerUpcomingRidesData, loading: passengerUpcomingLoading }] = useLazyQuery(GET_USER_RIDES_BY_STATUS, {
    client: ridesClient,
    fetchPolicy: 'network-only',
  });

  const [fetchPassengerActiveRides, { data: passengerActiveRidesData, loading: passengerActiveLoading }] = useLazyQuery(GET_USER_RIDES_BY_STATUS, {
    client: ridesClient,
    fetchPolicy: 'network-only',
  });

  const [fetchDriverUpcomingRides, { data: driverUpcomingRidesData, loading: driverUpcomingLoading }] = useLazyQuery(GET_DRIVER_RIDES_BY_STATUS, {
    client: ridesClient,
    fetchPolicy: 'network-only',
  });

  const [fetchDriverActiveRides, { data: driverActiveRidesData, loading: driverActiveLoading }] = useLazyQuery(GET_DRIVER_RIDES_BY_STATUS, {
    client: ridesClient,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }

    // Ensure all fetch functions are defined before calling them
    if (!userLoading && userData?.me && 
        fetchPassengerUpcomingRides && fetchPassengerActiveRides &&
        fetchDriverUpcomingRides && fetchDriverActiveRides) {
      const context = { headers: { authorization: `Bearer ${accessToken}` } };
      
      if (isDriver) {
        fetchDriverUpcomingRides({
          variables: { status: "PENDING" },
          context,
        });
        fetchDriverActiveRides({
          variables: { status: "IN_PROGRESS" },
          context,
        });
      } else {
        fetchPassengerUpcomingRides({
          variables: { status: "PENDING" },
          context,
        });
        fetchPassengerActiveRides({
          variables: { status: "IN_PROGRESS" },
          context,
        });
      }
    }
  }, [accessToken, router, userLoading, userData, isDriver, 
      fetchDriverActiveRides, fetchDriverUpcomingRides, 
      fetchPassengerActiveRides, fetchPassengerUpcomingRides]);

  // Cache driver's rides in localStorage
  useEffect(() => {
    if (isDriver && driverUpcomingRidesData?.getDriverRideByStatus) {
      const rides = driverUpcomingRidesData.getDriverRideByStatus;
      localStorage.setItem('driverRides', JSON.stringify(rides));
    }
  }, [isDriver, driverUpcomingRidesData]);

  const isLoading = userLoading || (driverUpcomingLoading || driverActiveLoading || passengerUpcomingLoading || passengerActiveLoading);

  const upcomingRides = isDriver ? driverUpcomingRidesData?.getDriverRideByStatus || [] : passengerUpcomingRidesData?.getUserRideByStatus || [];
  const activeRides = isDriver ? driverActiveRidesData?.getDriverRideByStatus || [] : passengerActiveRidesData?.getUserRideByStatus || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 rounded-full bg-[#5F47E6] animate-ping" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
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
                onClick={() => router.push('/ride-creation')}
                className="bg-[#F28C28] hover:bg-[#e57c1d] text-white"
              >
                Create a Ride
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingRides.map((ride: Ride) => (
                <RideCard key={ride.id} ride={ride} isDriverView={isDriver} />
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
                <RideCard key={ride.id} ride={ride} isDriverView={isDriver} />
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
