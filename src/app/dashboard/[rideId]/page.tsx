'use client';

import { use } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RIDE_BY_ID, UPDATE_RIDE_STATUS } from '@/lib/graphql/queries';
import { ridesClient } from '@/lib/apollo-client';
import { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, AlertCircle } from 'lucide-react';
import RideMap from './RideMap';


interface MeetingPoint {
  id: string;
  price: number;
  orderIndex: number;
  meetingPoint: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

interface Passenger {
  passengerId: number;
  passengerName: string;
  createdAt: string;
}

interface Ride {
  id: string;
  status: string;
  driverId: number;
  girlsOnly: boolean;
  toGIU: boolean;
  departureTime: string;
  createdAt: string;
  updatedAt: string;
  seatsAvailable: number;
  area: { name: string };
  meetingPoints: MeetingPoint[];
  passengers: Passenger[];
  reviews: any[];
}

interface RideDetailsProps {
  params: Promise<{ rideId: string }>;
}

export default function RideDetails({ params }: RideDetailsProps) {
  const { rideId } = use(params);
  const rideIdNumber = Number(rideId);

  const { data, loading, error, refetch } = useQuery<{ ride: Ride }>(GET_RIDE_BY_ID, {
    variables: { id: rideIdNumber },
    client: ridesClient,
  });

  const [newStatus, setNewStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const [updateRideStatus, { loading: updating }] = useMutation(UPDATE_RIDE_STATUS, {
    client: ridesClient,
    onCompleted: () => {
      refetch();
      setNewStatus('');
      setDialogOpen(false);
    },
  });

  const handleStatusChange = async () => {
    if (!newStatus) return;
    setDialogOpen(true);
  };

  const confirmUpdate = async () => {
    await updateRideStatus({ variables: { rideId: rideIdNumber, status: newStatus } });
  };

  if (loading) return <p className="p-6 text-gray-700">Loading ride details...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error.message}</p>;

  const ride = data?.ride;
  if (!ride) return <p className="p-6 text-gray-500">Ride not found.</p>;

  const formattedDate = new Date(ride.departureTime).toLocaleString();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 bg-gray-50 min-h-screen">
      {/* Header with status badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">🚗 Ride Details</h1>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${ride.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-600' : ride.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          {ride.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Ride info and controls */}
        <div className="space-y-8">
          {/* Ride Info Card */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Ride Information</h2>
            
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-5 h-5 text-[#F28C28]" />
              <span><strong>Departure:</strong> {formattedDate}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-[#F28C28]" />
              <span><strong>Area:</strong> {ride.area.name}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-700">
              <Users className="w-5 h-5 text-[#F28C28]" />
              <span><strong>Passengers:</strong> {ride.passengers.length}</span>
            </div>
            
            {ride.girlsOnly && (
              <div className="flex items-center gap-3 text-pink-600">
                <AlertCircle className="w-5 h-5" />
                <span><strong>Girls Only Ride</strong></span>
              </div>
            )}
            
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-5 h-5 text-[#F28C28]" />
              <span><strong>Direction:</strong> {ride.toGIU ? 'To GIU' : 'From GIU'}</span>
            </div>
          </div>

          {/* Status Update Card */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Update Ride Status</h2>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Select onValueChange={setNewStatus} value={newStatus}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleStatusChange}
                    disabled={!newStatus || updating}
                    className="bg-[#F28C28] hover:bg-[#e57c1d] text-white w-full sm:w-auto"
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Status Update</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to update the ride status to <span className="font-bold">{newStatus}</span>?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="default" onClick={confirmUpdate} className="bg-[#F28C28] hover:bg-[#e57c1d] text-white">Confirm</Button>
                    <DialogClose asChild>
                      <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Meeting Points Card */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📍 Meeting Points</h2>
            <ul className="space-y-4">
              {ride.meetingPoints.map((mp) => (
                <li
                  key={mp.id}
                  className="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-800">{mp.meetingPoint.name}</p>
                    <p className="text-[#F28C28] font-bold">EGP {mp.price}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column - Map and Passengers */}
        <div className="space-y-8">
          {/* Map Card */}
          <RideMap ride={ride} />

          {/* Passengers Card */}
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 Passengers</h2>
            {ride.passengers.length === 0 ? (
              <p className="text-gray-500 italic">No passengers have joined this ride yet.</p>
            ) : (
              <ul className="space-y-3">
                {ride.passengers.map((p, idx) => (
                  <li
                    key={idx}
                    className="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-all"
                  >
                    <p className="font-medium text-gray-800">{p.passengerName}</p>
                    <p className="text-sm text-gray-500">Joined: {new Date(p.createdAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
