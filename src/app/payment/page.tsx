"use client"; // Add this directive for client-side hooks

import { Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { CheckCircle, LoaderCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from 'next/navigation';
import { useQuery } from "@apollo/client";
import { GET_BOOKING_BY_ID } from "@/lib/graphql/queries"; // Import the query
import { bookingClient } from "@/lib/apollo-client"; // Import the specific client
import { useEffect, useState } from "react";
import { format } from 'date-fns'; // For date formatting

// Separate client component for the payment content
function PaymentContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const rideId = searchParams.get('rideId'); // Although rideId is passed, booking details should contain ride info

  const [displayBookingId, setDisplayBookingId] = useState<string | null>(null);

  // Use useEffect to ensure bookingId is accessed only on the client-side
  useEffect(() => {
    if (bookingId) {
      setDisplayBookingId(bookingId);
    }
  }, [bookingId]);

  const { data, loading, error } = useQuery(GET_BOOKING_BY_ID, {
    variables: { id: displayBookingId },
    client: bookingClient, // Use the booking service client
    skip: !displayBookingId, // Skip query if bookingId is not yet available
  });

  const bookingDetails = data?.booking;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      {loading && (
        <>
          <LoaderCircle className="w-16 h-16 text-orange-500 animate-spin mb-4" />
          <h1 className="text-2xl font-bold mb-2">Processing Payment Confirmation...</h1>
          <p className="text-muted-foreground mb-6">
            Please wait while we fetch your booking details.
          </p>
        </>
      )}

      {error && !loading && (
        <>
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error Fetching Booking</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't retrieve the details for booking ID: {displayBookingId}. Please contact support.
          </p>
          <p className="text-sm text-red-600 mb-6">Error: {error.message}</p>
          <Link href="/dashboard">
            <Button variant="outline">
              Go to Dashboard
            </Button>
          </Link>
        </>
      )}

      {bookingDetails && !loading && !error && (
        <>
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Your booking has been confirmed.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-left mb-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-3 text-center">Booking Summary</h2>
            <p><strong>Booking ID:</strong> {bookingDetails.id}</p>
            <p><strong>Status:</strong> <span className={`font-medium ${bookingDetails.status === 'SUCCEEDED' ? 'text-green-600' : 'text-yellow-600'}`}>{bookingDetails.status}</span></p>
            <p><strong>Amount Paid:</strong> {bookingDetails.price ? `${bookingDetails.price} EGP` : 'N/A'}</p>
            {bookingDetails.ride && (
              <>
                <hr className="my-3" />
                <p><strong>Ride ID:</strong> {bookingDetails.ride.id}</p>
                <p><strong>Direction:</strong> {bookingDetails.ride.to_giu ? 'To GIU' : 'From GIU'}</p>
              </>
            )}
          </div>
          <Link href="/dashboard">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Go to Dashboard
            </Button>
          </Link>
        </>
      )}

      {/* Fallback if bookingId is missing */}
      {!displayBookingId && !loading && !error && (
         <>
          <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Missing Information</h1>
          <p className="text-muted-foreground mb-6">
            Could not find booking information in the URL.
          </p>
          <Link href="/dashboard">
            <Button variant="outline">
              Go to Dashboard
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

// Main page component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <LoaderCircle className="w-16 h-16 text-orange-500 animate-spin mb-4" />
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          <p className="text-muted-foreground mb-6">
            Please wait while we load the payment details.
          </p>
        </div>
      }>
        <PaymentContent />
      </Suspense>
    </ProtectedRoute>
  );
}