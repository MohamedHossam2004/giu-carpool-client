'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RIDE_BY_ID, CANCEL_BOOKING } from '@/lib/graphql/queries'; // Changed REMOVE_PASSENGER to CANCEL_BOOKING
import { ridesClient, bookingClient } from '@/lib/apollo-client'; // Added bookingClient
import { useState } from 'react';
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
  passengerId: number;
  passengerName: string;
  createdAt: string;
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
  });
  console.log(data)
  const [cancelling, setCancelling] = useState(false); // Renamed from removing


  const [cancelBookingMutation] = useMutation(CANCEL_BOOKING, { 
    client: bookingClient, // Changed from ridesClient
    onCompleted: () => router.push('/dashboard'),
    onError: (err) => {
      console.error("Failed to cancel booking:", err.message); // Updated error message
      setCancelling(false);
    }
  });

  if (loading) return <div className="p-6 text-gray-700">Loading ride details...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;

  const ride = data?.ride;
  if (!ride) return <div className="p-6 text-gray-500">Ride not found.</div>;

  const formattedDate = new Date(ride.departureTime).toLocaleString();

  const handleCancelRide = async () => {
    // TODO: Ensure 'bookingIdForCancellation' is correctly sourced. This should be the ID of the user's specific booking for this ride.
    // As a placeholder, rideIdNumber is used, but this is INCORRECT for the CANCEL_BOOKING mutation if it's not the bookingId.
    // The actual bookingId needs to be fetched or passed to this component.
    const bookingIdForCancellation = rideIdNumber; // <<< --- !!! THIS IS A PLACEHOLDER AND LIKELY WRONG !!! Replace with actual bookingId.

    if (bookingIdForCancellation === null) {
      console.error("Booking ID not available for cancellation.");
      // Optionally, show an error to the user
      return;
    }

    setCancelling(true);
    try {
      await cancelBookingMutation({
        variables: {
          id: bookingIdForCancellation, // Changed from rideId to id, and ensure this is the bookingId
        },
      });
    } catch (err) {
      console.error("Cancel failed:", (err as Error).message);
      setCancelling(false);
    }
  };

  const canCancel = ride.status !== 'IN_PROGRESS';

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">🚌 Ride Details</h1>
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
                  disabled={cancelling} // Changed from removing
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Leave Ride'} {/* Changed from removing */}
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

      {/* Ride Info */}
      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 space-y-4">
        <div className="flex items-center gap-3 text-gray-700">
          <CalendarDays className="w-5 h-5 text-[#5F47E6]" />
          <span><strong>Departure:</strong> {formattedDate}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <MapPin className="w-5 h-5 text-[#F28C28]" />
          <span><strong>Area:</strong> {ride.area.name}</span>
        </div>
        <div className="text-gray-700">
          <strong>Status:</strong>{' '}
          <span
            className={`font-semibold ${
              ride.status === 'IN_PROGRESS'
                ? 'text-green-600'
                : ride.status === 'CANCELLED'
                ? 'text-red-600'
                : 'text-gray-800'
            }`}
          >
            {ride.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Meeting Points */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">📍 Meeting Points</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ride.meetingPoints.map((mp) => (
            <div
              key={mp.id}
              className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm"
            >
              <p className="text-gray-700"><strong>Point:</strong> {mp.meetingPoint.name}</p>
              <p className="text-gray-700"><strong>Price:</strong> <span className="text-[#5F47E6] font-semibold">EGP {mp.price}</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
