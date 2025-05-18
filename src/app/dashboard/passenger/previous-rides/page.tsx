'use client';

import { useState, useEffect } from 'react';
import { Clock, Circle, Star } from "lucide-react";
import { format } from "date-fns";
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createRideReview, getRideReviews } from "@/lib/services/review";
import { getMeetingPointName } from "@/lib/services/area";
import { gql } from '@apollo/client';
import { ridesClient } from '@/lib/apollo-client';

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

interface Ride {
  id: string;
  status: string;
  driverId: string;
  girlsOnly: boolean;
  toGIU: boolean;
  departureTime: string;
  seatsAvailable: number;
  area: {
    id: string;
    name: string;
  };
  meetingPoints: {
    id: string;
    price: number;
    meetingPoint: {
      name: string;
    };
  }[];
  passengers: {
    passengerId: string;
  }[];
  reviews: {
    id: string;
  }[];
}

interface ReviewDialogProps {
  rideId: string;
  driverId: string;
  onReviewSubmit: () => void;
}

function ReviewDialog({ rideId, driverId, onReviewSubmit }: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userObject = Cookies.get('user');
    const parsedUser = userObject ? JSON.parse(userObject) : null;
    setUserId(parsedUser?.id || null);
  }, []);

  const handleStarClick = (index: number) => {
    setRating(index + 1);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Rating Required",
        description: "Please select a star rating.",
      });
      return;
    }
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Could not verify user. Please log in again.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createRideReview({
        rideId,
        riderId: userId,
        rating,
        review: reviewText || undefined,
      });
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      onReviewSubmit();
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Could not submit review. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Leave a Review</DialogTitle>
        <div className="text-sm text-muted-foreground mt-2">
          Share your experience...
        </div>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`h-6 w-6 cursor-pointer ${
                  index < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                }`}
                onClick={() => handleStarClick(index)}
              />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reviewText">Review (Optional)</Label>
          <Textarea
            id="reviewText"
            placeholder="Share your experience..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting || rating === 0 || !userId}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function RideItem({ ride }: { ride: Ride }) {
  const [formattedDate, setFormattedDate] = useState('');
  const isCompleted = ride.status === 'COMPLETED';
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const userId = Cookies.get('user') ? JSON.parse(Cookies.get('user')!).id : null;
  const wasPassenger = ride.passengers.some(p => p.passengerId === userId);

  useEffect(() => {
    const date = new Date(parseInt(ride.departureTime));
    setFormattedDate(format(date, 'dd/MM/yyyy, HH:mm'));

    const fetchReviews = async () => {
      if (!userId) return;

      try {
        const reviews = await getRideReviews(ride.id);
        const userReview = reviews.find((review) => review.riderId === userId);
        setHasReviewed(!!userReview);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [ride.id, userId]);

  const handleReviewSubmit = () => {
    setIsReviewDialogOpen(false);
    setHasReviewed(true);
  };

  // Calculate minimum price safely
  const minPrice = ride.meetingPoints?.length 
    ? Math.min(...ride.meetingPoints.map(mp => mp.price))
    : 0;

  return (
    <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
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
                  {ride.toGIU ? `From ${ride.area.name}` : 'From German International University'}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Circle className="h-4 w-4 fill-orange-500 text-orange-500" />
                <span className="text-black">
                  {ride.toGIU ? 'To German International University' : `To ${ride.area.name}`}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="font-medium text-black">EGP {minPrice.toFixed(2)}</div>
            <div className="text-green-600 font-medium">
              {ride.status}
            </div>
            {!wasPassenger && (
              <div className="text-red-600 font-medium">
                Not a Passenger
              </div>
            )}
            {isCompleted && wasPassenger && (
              hasReviewed ? (
                <Button
                  className="bg-gray-400 text-white cursor-not-allowed"
                  size="sm"
                  disabled
                >
                  Reviewed
                </Button>
              ) : (
                <DialogTrigger asChild>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    size="sm"
                    disabled={loadingReviews}
                  >
                    Leave Review
                  </Button>
                </DialogTrigger>
              )
            )}
          </div>
        </div>
      </div>
      {isCompleted && wasPassenger && !hasReviewed && (
        <ReviewDialog
          rideId={ride.id}
          driverId={ride.driverId}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </Dialog>
  );
}

export default function PassengerPreviousRidesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedRides, setCompletedRides] = useState<Ride[]>([]);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await fetch("https://3.239.254.154/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("accessToken")}`,
          },
          body: JSON.stringify({
            query: GET_USER_RIDES_BY_STATUS.loc?.source.body,
            variables: {
              status: "COMPLETED"
            }
          }),
        });

        const data = await response.json();
        
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        setCompletedRides(data.data.getUserRideByStatus);
      } catch (err) {
        console.error('Error fetching rides:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch rides');
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32 text-black">
        Loading previous rides...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading rides: {error}
      </div>
    );
  }

  if (completedRides.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold text-black">Previous Rides</h2>
        <div className="text-center text-black">No completed rides found</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold text-black">Previous Rides</h2>
      <div className="space-y-4">
        {completedRides.map((ride) => (
          <RideItem key={ride.id} ride={ride} />
        ))}
      </div>
    </div>
  );
} 