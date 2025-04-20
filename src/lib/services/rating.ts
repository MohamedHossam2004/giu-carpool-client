import { ridesClient } from '../apollo-client';
import { GET_DRIVER_AVERAGE_RATING } from '../graphql/queries';
import Cookies from 'js-cookie';
interface DriverRating {
  averageRating: number;
  reviewCount: number;
}

export async function getDriverRating(driverId: string): Promise<DriverRating | null> {
  try {
    const accessToken = Cookies.get('accessToken');
    const { data } = await ridesClient.query({
      query: GET_DRIVER_AVERAGE_RATING,
      variables: { driverId },
      fetchPolicy: 'network-only',
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      }
    });
    return data.getDriverAverageRating;
  } catch (error) {
    console.error('Error fetching driver rating:', error);
    return null;
  }
} 