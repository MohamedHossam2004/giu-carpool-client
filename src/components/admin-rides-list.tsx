'use client';

import { Clock, Circle, Star, MapPin, Users } from "lucide-react";
import { format } from "date-fns";

interface Area {
  id: string;
  name: string;
  isActive: boolean;
}

interface MeetingPoint {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  isActive: boolean;
}

interface RideMeetingPoint {
  id: string;
  price: number;
  orderIndex: number;
  meetingPoint: MeetingPoint;
}

interface Passenger {
  id: string;
  passengerId: string;
  passengerName: string;
  createdAt: string;
}

interface Review {
  id: string;
  rating: number;
  review: string;
  createdAt: string;
}

interface Ride {
  id: string;
  status: string;
  driverId: string;
  girlsOnly: boolean;
  toGIU: boolean;
  departureTime: string;
  seatsAvailable: number;
  createdAt: string;
  updatedAt: string;
  area: Area;
  meetingPoints: RideMeetingPoint[];
  passengers: Passenger[];
  reviews: Review[];
}

interface AdminRidesListProps {
  rides: Ride[];
}

function RideItem({ ride }: { ride: Ride }) {
  const date = new Date(parseInt(ride.departureTime));
  const formattedDate = format(date, 'dd/MM/yyyy, HH:mm');

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
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          ride.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          ride.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
          ride.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
          'bg-orange-100 text-orange-800'
        }`}>
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
          <div className="text-sm text-pink-600 font-medium flex items-center gap-2">
            <Star className="h-4 w-4" />
            Girls only
          </div>
        )}

        {ride.passengers.length > 0 && (
          <div className="mt-2 p-2 bg-blue-50 rounded-md">
            <h4 className="text-sm font-medium text-blue-800">Passengers:</h4>
            <ul className="mt-1 space-y-1">
              {ride.passengers.map((passenger) => (
                <li key={passenger.id} className="text-sm text-blue-700">
                  {passenger.passengerName}
                </li>
              ))}
            </ul>
          </div>
        )}

        {ride.reviews.length > 0 && (
          <div className="mt-2 p-2 bg-amber-50 rounded-md">
            <h4 className="text-sm font-medium text-amber-800">Reviews:</h4>
            <ul className="mt-1 space-y-1">
              {ride.reviews.map((review) => (
                <li key={review.id} className="text-sm text-amber-700">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{review.rating}/5</span>
                  </div>
                  {review.review && (
                    <p className="mt-1 italic">"{review.review}"</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-500">Starting from</span>
          <div className="text-lg font-bold text-black">
            EGP {Math.min(...ride.meetingPoints.map(mp => mp.price)).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminRidesList({ rides }: AdminRidesListProps) {
  if (rides.length === 0) {
    return (
      <div className="text-center text-black">No rides found</div>
    );
  }

  return (
    <div className="space-y-4">
      {rides.map((ride) => (
        <RideItem key={ride.id} ride={ride} />
      ))}
    </div>
  );
} 