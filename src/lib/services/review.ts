import { ridesClient } from '../apollo-client';
import { CREATE_RIDE_REVIEW } from '../graphql/queries';
import Cookies from 'js-cookie';

interface ReviewData {
  rideId: string;
  riderId: string; // Assuming you can get the current user's ID
  rating: number;
  review?: string;
}

export async function createRideReview(reviewData: ReviewData): Promise<any> {
  const accessToken = Cookies.get('accessToken');

  try {
    const { data } = await ridesClient.mutate({
      mutation: CREATE_RIDE_REVIEW,
      variables: reviewData,
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      }
    });
    console.log('Review created:', data.createRideReview);
    return data.createRideReview;
  } catch (error) {
    console.error('Error creating ride review:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
