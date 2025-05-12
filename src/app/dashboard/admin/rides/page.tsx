'use client';

import { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { ridesClient } from '@/lib/apollo-client';
import Cookies from 'js-cookie';
import { AdminRidesList } from '@/components/admin-rides-list';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const ADMIN_GET_ALL_RIDES = gql`
  query {
    adminGetAllRides {
      id
      status
      driverId
      girlsOnly
      toGIU
      departureTime
      seatsAvailable
      createdAt
      updatedAt
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
          longitude
          latitude
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

export default function AdminRidesPage() {
  const [error, setError] = useState<string | null>(null);
  const accessToken = Cookies.get('accessToken');

  const { data, loading, error: queryError } = useQuery(ADMIN_GET_ALL_RIDES, {
    client: ridesClient,
    context: {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }
  });

  useEffect(() => {
    if (queryError) {
      setError('Failed to fetch rides. Please try again later.');
    }
  }, [queryError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 rounded-full bg-blue-500 animate-ping" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Rides</h1>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <AdminRidesList rides={data?.adminGetAllRides || []} />
      </div>
    </div>
  );
} 