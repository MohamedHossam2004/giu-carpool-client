import { bookingClient } from '../apollo-client';
import { GET_BOOKINGS } from '../graphql/queries';

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

export async function getUserBookings(): Promise<Booking[]> {
  try {
    const { data } = await bookingClient.query({
      query: GET_BOOKINGS,
      fetchPolicy: 'network-only'
    });

    return data.getBookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
} 