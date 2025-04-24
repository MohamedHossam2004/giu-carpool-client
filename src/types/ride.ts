export interface CreateRideInput {
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  description?: string;
  carDetails?: {
    model: string;
    color: string;
    licensePlate: string;
  };
}

export interface Ride {
  id: string;
  driverId: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  description?: string;
  carDetails?: {
    model: string;
    color: string;
    licensePlate: string;
  };
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
} 