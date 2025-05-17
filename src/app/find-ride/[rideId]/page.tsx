'use client';

import { use } from 'react';
import { useQuery } from '@apollo/client';
import { GET_RIDE_BY_ID, GET_DRIVER_AVERAGE_RATING, GET_DRIVER_REVIEWS_LIST } from '@/lib/graphql/queries';
import { ridesClient, userClient } from '@/lib/apollo-client';
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
import { MapPin, Calendar, Clock, Users, AlertCircle, Star, ArrowLeft } from 'lucide-react';
import RideMap from '@/app/dashboard/[rideId]/RideMap';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useToast } from '@/components/ui/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

interface MeetingPoint {
  id: string;
  price: number;
  orderIndex: number;
  meetingPoint: {
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
    isActive: boolean;
  };
}

interface Passenger {
  passengerId: number;
  passengerName: string;
  createdAt: string;
}

interface Review {
  id: string;
  rating: number;
  review: string | null; // Review text can be null
  createdAt: string;
  // Add other fields if needed, e.g., reviewerName, though not directly available from ride.reviews
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
  reviews: Review[]; // Updated to use the Review interface
}

interface RideDetailsProps {
  params: Promise<{ rideId: string }>;
}

function PassengerRideDetailsContent({ params }: RideDetailsProps) {
  const { rideId } = use(params);
  const rideIdNumber = Number(rideId);
  const router = useRouter();
  const { toast } = useToast();

  const { data, loading, error } = useQuery<{ ride: Ride }>(GET_RIDE_BY_ID, {
    variables: { id: rideIdNumber },
    client: ridesClient,
  });

  const { data: driverRatingData } = useQuery(GET_DRIVER_AVERAGE_RATING, {
    variables: { driverId: data?.ride?.driverId },
    client: ridesClient, // Changed from userClient to ridesClient
    skip: !data?.ride?.driverId,
  });

  const { data: driverReviewsData, loading: driverReviewsLoading, error: driverReviewsError } = useQuery<{ getDriverReviews: Review[] }>(
    GET_DRIVER_REVIEWS_LIST,
    {
      variables: { driverId: data?.ride?.driverId },
      client: ridesClient, 
      skip: !data?.ride?.driverId, 
    }
  );

  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState<MeetingPoint | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const handleBackClick = () => {
    router.back();
  };

  const handleSelectMeetingPoint = (meetingPoint: MeetingPoint) => {
    setSelectedMeetingPoint(meetingPoint);
    setBookingDialogOpen(true);
  };

  const handleBookRide = async () => {
    if (!selectedMeetingPoint) return;
    
    setIsBooking(true);
    try {
      const response = await fetch("https://54.211.248.22/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({
          query: `mutation CreateBooking($rideId: Int!, $meetingPointId: Int!) {
                    createBooking(ride_id: $rideId, meeting_point_id: $meetingPointId) {
                        id
                        status
                    }
                  }`,
          variables: {
            rideId: rideIdNumber,
            meetingPointId: Number(selectedMeetingPoint.meetingPoint.id),
          },
        }),
      });

      const responseData = await response.json();
      
      if (responseData.errors) {
        throw new Error(responseData.errors[0].message);
      }

      const bookingId = responseData.data.createBooking.id;

      // Wait for 5 seconds before fetching the payment URL
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Fetch the payment URL
      const paymentResponse = await fetch(`http://100.27.16.234:4002/${bookingId}/payment-url/`, {
        method: "GET"
      });
      
      const paymentData = await paymentResponse.json();
      
      if (paymentData.checkoutUrl) {
        window.location.href = paymentData.checkoutUrl;
      } else {
        throw new Error("Payment URL not found");
      }
    } catch (error) {
      console.error("Error booking ride:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to book ride. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
      setBookingDialogOpen(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-700">Loading ride details...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error.message}</p>;

  const ride = data?.ride;
  if (!ride) return <p className="p-6 text-gray-500">Ride not found.</p>;

  const formattedDate = new Date(ride.departureTime).toLocaleString();
  const driverRating = driverRatingData?.getDriverAverageRating?.averageRating || 0;
  const reviewCount = driverRatingData?.getDriverAverageRating?.reviewCount || 0;
  const actualReviews = driverReviewsData?.getDriverReviews || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 bg-gray-50 min-h-screen">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={handleBackClick} 
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to search results
      </Button>
      
      {/* Header with status badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">🚗 Ride Details</h1>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${ride.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-600' : ride.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          {ride.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Ride info and booking */}
        <div className="space-y-8">
          {/* Ride Info Card */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Ride Information</h2>
            
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-5 h-5 text-[#F28C28]" />
              <span><strong>Departure:</strong> {formattedDate}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-[#F28C28]" />
              <span><strong>Area:</strong> {ride.area.name}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-700">
              <Users className="w-5 h-5 text-[#F28C28]" />
              <span><strong>Available Seats:</strong> {ride.seatsAvailable}</span>
            </div>
            
            {ride.girlsOnly && (
              <div className="flex items-center gap-3 text-pink-600">
                <AlertCircle className="w-5 h-5" />
                <span><strong>Girls Only Ride</strong></span>
              </div>
            )}
            
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-5 h-5 text-[#F28C28]" />
              <span><strong>Direction:</strong> {ride.toGIU ? 'To GIU' : 'From GIU'}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Star className="w-5 h-5 text-[#F28C28]" />
              <span>
                <strong>Driver Rating:</strong> {driverRating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>
          </div>

          {/* Meeting Points Card with Booking */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📍 Meeting Points</h2>
            <p className="text-gray-600 mb-4">Select a meeting point to book this ride:</p>
            
            <ul className="space-y-4">
              {ride.meetingPoints.map((mp) => (
                <li
                  key={mp.id}
                  className="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleSelectMeetingPoint(mp)}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-800">{mp.meetingPoint.name}</p>
                    <p className="text-[#F28C28] font-bold">EGP {mp.price}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Booking</DialogTitle>
                  <DialogDescription>
                    {selectedMeetingPoint && (
                      <>
                        <div className="mt-2">Meeting Point: <strong>{selectedMeetingPoint.meetingPoint.name}</strong></div>
                        <div>Price: <strong>EGP {selectedMeetingPoint.price}</strong></div>
                        <div className="mt-2">You will be redirected to the payment page after confirmation.</div>
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="default" 
                    onClick={handleBookRide} 
                    disabled={isBooking}
                    className="bg-[#F28C28] hover:bg-[#e57c1d] text-white"
                  >
                    {isBooking ? 'Processing...' : 'Confirm & Pay'}
                  </Button>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Driver Reviews Card */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">⭐ Driver Reviews</h2>
            {driverReviewsLoading && <p className="text-gray-500 italic">Loading reviews...</p>}
            {driverReviewsError && <p className="text-red-500 italic">Error loading reviews: {driverReviewsError.message}</p>}
            {!driverReviewsLoading && !driverReviewsError && actualReviews.length > 0 ? (
              <ul className="space-y-4">
                {actualReviews.map((review) => (
                  <li key={review.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.review && <p className="text-gray-700">{review.review}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No reviews available for this driver.</p>
            )}
          </div>
        </div>

        {/* Right column - Map and Passengers */}
        <div className="space-y-8">
          {/* Map Card */}
          <RideMap ride={ride} />

          {/* Passengers Card */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 Passengers</h2>
            {ride.passengers.length === 0 ? (
              <p className="text-gray-500 italic">No passengers have joined this ride yet.</p>
            ) : (
              <ul className="space-y-3">
                {ride.passengers.map((p, idx) => (
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
      </div>
    </div>
  );
}

export default function PassengerRideDetails({ params }: RideDetailsProps) {
  return (
    <ProtectedRoute passengerOnly={true}>
      <PassengerRideDetailsContent params={params} />
    </ProtectedRoute>
  );
}