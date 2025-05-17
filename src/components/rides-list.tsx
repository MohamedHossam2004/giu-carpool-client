"use client"

import { Clock, Circle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getUserBookings } from "@/lib/services/booking"
import { format, set } from "date-fns"
import { getAreas, getMeetingPointName } from "@/lib/services/area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createRideReview, getRideReviews } from "@/lib/services/review"
import Cookies from 'js-cookie'

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

function RideItem({ booking }: { booking: Booking }) {
  const [formattedDate, setFormattedDate] = useState('');
  const isCompleted = booking.ride.status?.toUpperCase() === 'COMPLETED';
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const userId = Cookies.get('user') ? JSON.parse(Cookies.get('user')!).id : null;

  useEffect(() => {
    const date = new Date(parseInt(booking.ride.departure_time));
    setFormattedDate(format(date, 'dd/MM/yyyy, HH:mm'));

    const fetchReviews = async () => {
      if (!userId) return;

      try {
        const reviews = await getRideReviews(booking.ride_id);
        const userReview = reviews.find((review) => review.riderId === userId);
        setHasReviewed(!!userReview);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [booking.ride_id, userId]);

  const handleReviewSubmit = () => {
    setIsReviewDialogOpen(false);
    setHasReviewed(true);
  };

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
            {isCompleted ? (
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
            ) : (
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-black"
                disabled={!booking.successful}
                size="sm"
              >
                {booking.successful ? 'Reride' : booking.ride.status?.toUpperCase() ?? 'Unknown'}
              </Button>
            )}
          </div>
        </div>
      </div>
      {isCompleted && !hasReviewed && (
        <ReviewDialog
          rideId={booking.ride_id.toString()}
          driverId={booking.ride.driver_id.toString()}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </Dialog>
  );
}

export function RidesList() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        await getAreas();
        const data = await getUserBookings();
        const filteredData = data.filter((booking) =>
          booking.ride !== null &&
          booking.status !== 'CANCELLED'
        );
        console.log("Filtered Bookings with Status:", filteredData.map(b => ({ id: b.id, ride_status: b.ride?.status })));
        setBookings(filteredData);
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-32 text-black">Loading rides...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold text-black">My Rides</h2>
        <div className="text-center text-black">No rides found</div>
      </div>
    );
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
  );
}
