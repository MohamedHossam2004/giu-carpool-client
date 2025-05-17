'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RIDE_BY_ID, CANCEL_BOOKING, UPDATE_RIDE_STATUS } from '@/lib/graphql/queries'; // Changed REMOVE_PASSENGER to CANCEL_BOOKING
import { ridesClient, bookingClient } from '@/lib/apollo-client'; // Added bookingClient
import { useState, useEffect } from 'react';
import { getUserBookings } from '@/lib/services/booking';
import Cookies from 'js-cookie';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, MapPin, CalendarDays } from 'lucide-react';
import RideMap from './../../[rideId]/RideMap';

interface MeetingPoint {
  id: string;
  price: number;
  orderIndex: number;
  meetingPoint: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

interface Passenger {
  id: string;
  passengerId: string;
  passengerName: string;
  createdAt: string;
}

interface Booking {
  id: string;
  ride_id: string;
  user_id: string;
  price: number;
  status: string;
  successful: boolean;
  ride: {
    id: string;
    driver_id: string;
    departure_time: string;
    seats_available: number;
    status: string;
    girls_only: boolean;
    to_giu: boolean;
    area_id: string;
  };
}

interface Ride {
  id: string;
  status: string;
  driverId: number;
  girlsOnly: boolean;
  toGIU: boolean;
  departureTime: string;
  createdAt: string;
  updatedAt: string;
  seatsAvailable: number;
  area: { name: string };
  meetingPoints: MeetingPoint[];
  passengers: Passenger[];
  reviews: any[];
}

interface RideDetailsProps {
  params: Promise<{ rideId: string }>;
}

export default function RideDetails({ params }: RideDetailsProps) {
  const router = useRouter();
  const { rideId } = use(params);
  const rideIdNumber = Number(rideId);

  const { data, loading, error } = useQuery<{ ride: Ride }>(GET_RIDE_BY_ID, {
    variables: { id: rideIdNumber },
    client: ridesClient,
    fetchPolicy: 'network-only', // Force fetch from server, not cache
  });
  
  // Log ride data for debugging
  useEffect(() => {
    if (data) {
      console.log('Ride data fetched:', data.ride);
    }
  }, [data]);
  const [cancelling, setCancelling] = useState(false); // Renamed from removing
  const [booking, setBooking] = useState<Booking | null>(null);
  const userId = Cookies.get('user') ? JSON.parse(Cookies.get('user')!).id : null;

  useEffect(() => {
    const fetchUserBooking = async () => {
      try {
        const bookings = await getUserBookings();
        const userBooking = bookings.find(
          (booking) => {
            return parseInt(booking.ride_id) === parseInt(rideId)&& booking.successful
          }
        );
        setBooking(userBooking || null);
      } catch (error) {
        console.error('Error fetching user booking:', error);
      }
    };

    if (userId) {
      fetchUserBooking();
    }
  }, [rideId, userId]);

  const [cancelBookingMutation] = useMutation(CANCEL_BOOKING, { 
    client: bookingClient, // Changed from ridesClient
    onCompleted: () => router.push('/dashboard'),
    onError: (err) => {
      console.error("Failed to cancel booking:", err.message); // Updated error message
      setCancelling(false);
    }
  });

  if (loading) return (
    <div className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
      <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
      <p className="text-gray-700 font-medium">Loading ride details from server...</p>
    </div>
  );
  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;

  const ride = data?.ride;
  if (!ride) return <div className="p-6 text-gray-500">Ride not found.</div>;

  const formattedDate = new Date(ride.departureTime).toLocaleString();

  const handleCancelRide = async () => {
    if (!booking) {
      console.error("No booking found for this ride.");
      return;
    }

    setCancelling(true);
    try {
      await cancelBookingMutation({
        variables: {
          id: Number(booking.id),
        },
      });
    } catch (err) {
      console.error("Cancel failed:", (err as Error).message);
      setCancelling(false);
    }
  };

  const canCancel = ride.status !== 'IN_PROGRESS';

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 bg-gray-50 min-h-screen">
      {/* Header with status badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">🚌 Ride Details</h1>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${ride.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-600' : ride.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            {ride.status}
          </div>
          {canCancel && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#F28C28] hover:bg-[#e57c1d] text-white">
                  Cancel My Ride
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-600">Confirm Cancellation</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 text-sm text-red-600 mt-2">
                    <AlertCircle className="h-4 w-4" />
                    You will be removed from this ride. The ride will continue for others.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleCancelRide}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Cancelling...' : 'Yes, Leave Ride'}
                  </Button>
                  <DialogClose asChild>
                    <Button variant="ghost">No, stay</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {!canCancel && (
            <span className="text-sm font-medium text-gray-500 italic">
              You cannot cancel a ride in progress.
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Ride info */}
        <div className="space-y-8">
          {/* Ride Info Card */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Ride Information</h2>
            
            <div className="flex items-center gap-3 text-gray-700">
              <CalendarDays className="w-5 h-5 text-[#F28C28]" />
              <span><strong>Departure:</strong> {formattedDate}</span>
            </div>
        <div className="flex items-center gap-3 text-gray-700">
          <MapPin className="w-5 h-5 text-[#F28C28]" />
          <span><strong>Area:</strong> {ride.area.name}</span>
        </div>

        {ride.girlsOnly && (
          <div className="flex items-center gap-3 text-pink-600">
            <AlertCircle className="w-5 h-5" />
            <span><strong>Girls Only Ride</strong></span>
          </div>
        )}

        <div className="flex items-center gap-3 text-gray-700">
          <span><strong>Direction:</strong> {ride.toGIU ? 'To GIU' : 'From GIU'}</span>
        </div>
          </div>

          {/* Meeting Points Card */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📍 Meeting Points</h2>
            <ul className="space-y-4">
              {ride.meetingPoints.map((mp) => (
                <li
                  key={mp.id}
                  className="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-800">{mp.meetingPoint.name}</p>
                    <p className="text-[#F28C28] font-bold">EGP {mp.price}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Passengers Card */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 Other Passengers</h2>
            {ride.passengers.length <= 1 ? (
              <p className="text-gray-500 italic">No other passengers have joined this ride yet.</p>
            ) : (
              <ul className="space-y-4">
                {ride.passengers
                  .filter(p => p.passengerId.toString() !== userId)
                  .map((p, idx) => (
                    <li
                      key={idx}
                      className="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-all"
                    >
                      <p className="font-medium text-gray-800">{p.passengerName}</p>
                      <p className="text-sm text-gray-500">Joined: {new Date(p.createdAt).toLocaleDateString()}</p>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column - Map */}
        <div className="space-y-8">
          {/* Map Card */}
            <div className="flex-grow">
              <RideMap ride={ride} />
            </div>
        </div>
      </div>
    </div>
  );
}
