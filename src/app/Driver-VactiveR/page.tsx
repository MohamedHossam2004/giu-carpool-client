'use client';

import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GET_DRIVER_RIDE_BY_STATUS } from '@/lib/graphql/queries';
import { ridesClient } from '@/lib/apollo-client';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie'; // Importing cookies to get the accessToken

interface MeetingPoint {
  price: number;
  orderIndex: number;
  meetingPoint: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
}

interface Ride {
  id: string;
  status: string;
  toGIU: boolean;
  girlsOnly: boolean;
  departureTime: string;
  area: {
    id: string;
    name: string;
  };
  meetingPoints: MeetingPoint[];
  passengers: {
    id: string;
    passengerId: string;
    passengerName: string;
  }[];
  reviews: {
    id: string;
    rating: number;
    review: string;
  }[];
}

export default function RidePage() {
  const { user } = useAuth();
  const driverId = user?.id;

  // Fetch pending rides
  const { data: pendingData, loading: pendingLoading, error: pendingError } = useQuery<{ getDriverRideByStatus: Ride[] }>(
    GET_DRIVER_RIDE_BY_STATUS,
    {
      variables: { status: 'PENDING' },
      skip: !driverId,
      context: {
        headers: {
          Authorization: `Bearer ${Cookies.get('accessToken')}`, // Attach the token here
        },
      },
      client: ridesClient,
    }
  );

  // Fetch in-progress rides
  const { data: activeData, loading: activeLoading, error: activeError } = useQuery<{ getDriverRideByStatus: Ride[] }>(
    GET_DRIVER_RIDE_BY_STATUS,
    {
      variables: { status: 'IN_PROGRESS' },
      skip: !driverId,
      context: {
        headers: {
          Authorization: `Bearer ${Cookies.get('accessToken')}`, // Attach the token here
        },
      },
      client: ridesClient,
    }
  );

  // Set the rides based on the fetched data
  const pendingRides = pendingData?.getDriverRideByStatus || [];
  const inProgressRides = activeData?.getDriverRideByStatus || [];

  const colorPalette = ['bg-green-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500'];

  if (pendingLoading || activeLoading) return <p className="p-4">Loading rides...</p>;
  if (pendingError || activeError)
    return (
      <p className="p-4 text-red-600">
        Error: {pendingError?.message || activeError?.message}
      </p>
    );

  return (
    <div className="min-h-screen bg-white p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">My Rides</h1>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-semibold rounded shadow hover:bg-orange-600">
            <span>⏱️</span> Recent Rides
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-semibold rounded shadow hover:bg-orange-600">
            <span>➕</span> Create Ride
          </button>
        </div>
      </header>

      {/* Pending Rides */}
      {pendingRides.length > 0 ? (
        pendingRides.map((ride) => (
          <Link href={`/Driver-VactiveR/${ride.id}`} key={ride.id}>
            <div className="cursor-pointer bg-gray-50 p-6 rounded-xl shadow-md max-w-4xl mx-auto hover:bg-gray-100 transition mb-6">
              <div className="flex items-center gap-2 text-gray-800 mb-4">
                <span className="text-xl">🕒</span>
                <span className="font-semibold text-md">
                  {new Date(ride.departureTime).toLocaleString()}
                </span>
              </div>
              <div className="ml-7 space-y-2">
                {ride.meetingPoints.map((point, idx) => (
                  <div key={idx} className="flex justify-between gap-2 text-gray-700 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${colorPalette[idx % colorPalette.length]}`}
                      ></span>
                      <span>{point.meetingPoint.name}</span>
                    </div>
                    <span className="text-gray-500">EGP {point.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-gray-700 text-sm mt-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                  <span>{ride.area.name}</span>
                </div>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <p className="p-4 text-gray-500">No pending rides found.</p>
      )}

      {/* In Progress Rides */}
      {inProgressRides.length > 0 ? (
        inProgressRides.map((ride) => (
          <div key={ride.id} className="bg-blue-50 p-6 rounded-xl shadow-md max-w-4xl mx-auto mb-6">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Active Ride</h2>
            <div className="flex items-center gap-2 text-gray-800 mb-4">
              <span className="text-xl">🕒</span>
              <span className="font-semibold text-md">
                {new Date(ride.departureTime).toLocaleString()}
              </span>
            </div>
            <div className="ml-7 space-y-2">
              {ride.meetingPoints.map((point, idx) => (
                <div key={idx} className="flex justify-between gap-2 text-gray-700 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${colorPalette[idx % colorPalette.length]}`}
                    ></span>
                    <span>{point.meetingPoint.name}</span>
                  </div>
                  <span className="text-gray-500">EGP {point.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-gray-700 text-sm mt-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                <span>{ride.area.name}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <button className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600">
                Continue Ride
              </button>
              <Link href={`/Driver-VactiveR/${ride.id}`} key={ride.id} className="text-blue-500 hover:underline">
                View Details
              </Link>
            </div>
          </div>
        ))
      ) : (
        <p className="p-4 text-gray-500">No active ride found.</p>
      )}
    </div>
  );
}
