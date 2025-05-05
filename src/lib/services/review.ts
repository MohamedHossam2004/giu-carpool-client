import { ridesClient } from '../apollo-client';
import { CREATE_RIDE_REVIEW, GET_RIDE_REVIEWS } from '../graphql/queries';
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

export async function getRideReviews(rideId: string): Promise<any[]> {
  try {
    const { data } = await ridesClient.query({
      query: GET_RIDE_REVIEWS,
      variables: { rideId },
      fetchPolicy: 'network-only', // Ensures fresh data is fetched
    });
    return data.getRideReviews;
  } catch (error) {
    console.error('Error fetching ride reviews:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
