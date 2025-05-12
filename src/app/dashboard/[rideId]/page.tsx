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
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🚗 Ride Details</h1>

      <div className="bg-white rounded-lg shadow-md p-5 mb-6">
        <p><strong>Status:</strong> {ride.status}</p>
        <p><strong>Departure:</strong> {formattedDate}</p>
        <p><strong>Area:</strong> {ride.area.name}</p>
      </div>

      <div className="mb-8 space-y-4">
        <label className="block text-sm font-medium text-gray-700">Update Ride Status</label>
        <div className="flex gap-3 items-center">
          <Select onValueChange={setNewStatus} value={newStatus}>
            <SelectTrigger className="w-[200px]">
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
              >
                {updating ? 'Updating...' : 'Update'}
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
                <Button variant="default" onClick={confirmUpdate}>Confirm</Button>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">📍 Meeting Points</h2>
      <ul className="space-y-3 mb-6">
        {ride.meetingPoints.map((mp) => (
          <li
            key={mp.id}
            className="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm"
          >
            <p><strong>Point:</strong> {mp.meetingPoint.name}</p>
            <p><strong>Price:</strong> EGP {mp.price}</p>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">👥 Passengers</h2>
      <ul className="space-y-3">
        {ride.passengers.length === 0 ? (
          <p className="text-gray-500">No passengers yet.</p>
        ) : (
          ride.passengers.map((p, idx) => (
            <li
              key={idx}
              className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm"
            >
              <p><strong>Name:</strong> {p.passengerName}</p>
         
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
