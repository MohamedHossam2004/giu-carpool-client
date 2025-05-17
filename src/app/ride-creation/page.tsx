"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, gql } from "@apollo/client"
import { ridesClient } from "@/lib/apollo-client"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Cookies from 'js-cookie'
import { ME_QUERY } from "@/lib/graphql/queries"
import { Area, MeetingPoint } from "@/types/area"
import CreateRideMap from "./CreateRideMap"
import { ProgressBar } from "@/components/ride-creation/ProgressBar"
import { RideDetailsForm } from "@/components/ride-creation/RideDetailsForm"
import { PricingForm } from "@/components/ride-creation/PricingForm"
import { VerificationForm } from "@/components/ride-creation/VerificationForm"

// Create Ride Mutation
const CREATE_RIDE_MUTATION = gql`
  mutation CreateRide(
    $areaId: Int!, 
    $pricing: [PricingInput!]!, 
    $toGIU: Boolean!, 
    $girlsOnly: Boolean!,
    $departureTime: String!
  ) {
    createRide(
      areaId: $areaId, 
      pricing: $pricing, 
      toGIU: $toGIU, 
      girlsOnly: $girlsOnly,
      departureTime: $departureTime
    ) {
      id
    }
  }
`

interface PricingInput {
  meetingPointId: number
  price: number
}

export default function CreateRidePage() {
  const router = useRouter();
  const [toGIU, setToGIU] = useState(true);
  const [girlsOnly, setGirlsOnly] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedMeetingPointIds, setSelectedMeetingPointIds] = useState<string[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [availableMeetingPoints, setAvailableMeetingPoints] = useState<MeetingPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'details' | 'pricing' | 'verification'>('details');
  const [meetingPointPrices, setMeetingPointPrices] = useState<{ [key: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [departureTime, setDepartureTime] = useState<string>("");

  const accessToken = Cookies.get('accessToken');
  const { data, loading: authLoading, error: authError } = useQuery(ME_QUERY, {
    context: {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }
  });

  useEffect(() => {
    if (!accessToken || authError) {
      router.push('/login');
      return;
    }
    fetchAreas();
  }, [data, authError, router, accessToken]);

  const checkRideLimit = () => {
    if (!data?.me?.isDriver) return true;

    const cachedRides = localStorage.getItem('driverRides');
    if (!cachedRides) return true;

    const rides = JSON.parse(cachedRides);
    const selectedDate = new Date(departureTime);
    const selectedDay = Math.floor(selectedDate.getTime() / (1000 * 60 * 60 * 24));
    
    // Filter rides for the same day number
    const sameDayRides = rides.filter((ride: any) => {
      const rideDate = new Date(parseInt(ride.departureTime));
      const rideDay = Math.floor(rideDate.getTime() / (1000 * 60 * 60 * 24));
      return rideDay === selectedDay;
    });

    const toGIURides = sameDayRides.filter((ride: any) => ride.toGIU);
    const fromGIURides = sameDayRides.filter((ride: any) => !ride.toGIU);

    if (toGIURides.length >= 1 && toGIU) {
      setError('You already have a ride to GIU for this day. You can only create one ride to GIU per day.');
      return false;
    }

    if (fromGIURides.length >= 1 && !toGIU) {
      setError('You already have a ride from GIU for this day. You can only create one ride from GIU per day.');
      return false;
    }

    return true;
  };

  const handleToGIUChange = (value: boolean) => {
    setToGIU(value);
  };

  const fetchAreas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://3.239.254.154/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          query: `
            query GetAreas {
              getAreas {
                id
                name
                isActive
                meetingPoints {
                  id
                  name
                  latitude
                  longitude
                  isActive
                }
              }
            }
          `
        }),
      });

      const result = await response.json();
      if (!response.ok || result.errors || !result.data?.getAreas) {
        throw new Error(result.errors?.[0]?.message || 'Failed to fetch areas');
      }

      setAreas(result.data.getAreas);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while fetching areas');
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
    const area = areas.find(a => a.id === areaId) || null;
    setSelectedArea(area);
    setSelectedMeetingPointIds([]);
    setAvailableMeetingPoints(area?.meetingPoints.filter(p => p.isActive) || []);
  };

  const handleMeetingPointSelect = (index: number, pointId: string) => {
    const newSelectedPoints = [...selectedMeetingPointIds];
    newSelectedPoints.splice(index, newSelectedPoints.length - index, pointId);
    setSelectedMeetingPointIds(newSelectedPoints);
  };

  const handleRemoveMeetingPoint = (index: number) => {
    const newSelectedPoints = [...selectedMeetingPointIds];
    newSelectedPoints.splice(index, 1);
    setSelectedMeetingPointIds(newSelectedPoints);
  };

  const getRemainingMeetingPoints = (index: number) => {
    if (!selectedArea) return [];
    return availableMeetingPoints.filter(point =>
      !selectedMeetingPointIds.slice(0, index).includes(point.id.toString())
    );
  };

  const handleContinueToPrice = () => {
    if (selectedMeetingPointIds.length > 0) {
      const initialPrices = { ...meetingPointPrices };
      selectedMeetingPointIds.forEach((id) => {
        if (!initialPrices[id]) initialPrices[id] = 0;
      });
      setMeetingPointPrices(initialPrices);
      setCurrentStep('pricing');
    }
  };

  const handlePriceChange = (pointId: string, price: number) => {
    setMeetingPointPrices((prev) => ({
      ...prev,
      [pointId]: price,
    }));
  };

  const [createRide, { loading: createRideLoading }] = useMutation(CREATE_RIDE_MUTATION, {
    client: ridesClient,
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    onCompleted: (data) => {
      if (data?.createRide?.id) {
        console.log('Ride created successfully with ID:', data.createRide.id);
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError('Failed to create ride');
        setIsSubmitting(false);
      }
    },
    onError: (error) => {
      console.error('Error in createRide mutation:', error);
      setError(error.message || 'An error occurred while creating the ride');
      setIsSubmitting(false);
    }
  });

  const handleContinueToVerification = () => {
    setCurrentStep('verification');
  };

  const handleCreateRide = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Check ride limit before creating
      if (!checkRideLimit()) {
        setIsSubmitting(false);
        return;
      }
      
      // Get current user ID from data
      const driverId = data?.me?.id;
      
      if (!driverId) {
        throw new Error('User ID not found. Please try logging in again.');
      }

      // Convert departure time to timestamp for Prisma
      const departureTimestamp = new Date(departureTime).toISOString();
      
      console.log('Creating ride with params:', {
        areaId: parseInt(selectedAreaId),
        driverId: parseInt(driverId),
        pricing: selectedMeetingPointIds.map((id) => ({
          meetingPointId: parseInt(id),
          price: meetingPointPrices[id] || 0,
        })),
        toGIU,
        girlsOnly,
        departureTime: departureTimestamp
      });
      
      await createRide({
        variables: {
          areaId: parseInt(selectedAreaId),
          driverId: parseInt(driverId),
          pricing: selectedMeetingPointIds.map((id) => ({
            meetingPointId: parseInt(id),
            price: meetingPointPrices[id] || 0,
          })),
          toGIU,
          girlsOnly,
          departureTime: departureTimestamp,
        }
      });
    } catch (error) {
      console.error('Error creating ride:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while creating the ride');
      setIsSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 animate-ping" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 flex">
          {currentStep === 'verification' ? (
            <div className="flex-1 p-6 max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="sm" className="p-0 h-8 w-8" onClick={() => setCurrentStep('pricing')}>
                  <ArrowLeft className="h-5 w-5 text-black" />
                </Button>
                <h1 className="text-2xl font-bold text-black">Verify Ride Details</h1>
              </div>
              
              <ProgressBar currentStep={currentStep} />

              {success ? (
                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-black mb-2">Ride Created Successfully!</h2>
                  <p className="text-gray-600 mb-6">Redirecting to dashboard...</p>
                </div>
              ) : (
                <VerificationForm
                  selectedArea={selectedArea}
                  selectedMeetingPointIds={selectedMeetingPointIds}
                  availableMeetingPoints={availableMeetingPoints}
                  meetingPointPrices={meetingPointPrices}
                  toGIU={toGIU}
                  girlsOnly={girlsOnly}
                  departureTime={departureTime}
                  onBack={() => setCurrentStep('pricing')}
                  onSubmit={handleCreateRide}
                />
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="w-[450px] p-6 border-r overflow-y-auto">
                <div className="flex items-center gap-2 mb-6">
                  {currentStep === 'pricing' && (
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8" onClick={() => setCurrentStep('details')}>
                      <ArrowLeft className="h-5 w-5 text-black" />
                    </Button>
                  )}
                  <h1 className="text-2xl font-bold text-black">
                    {currentStep === 'details' ? 'Create Ride' : 'Set Pricing'}
                  </h1>
                </div>
                
                <ProgressBar currentStep={currentStep} />

                <div className="space-y-6">
                  {currentStep === 'details' ? (
                    <RideDetailsForm 
                      areas={areas}
                      selectedAreaId={selectedAreaId}
                      selectedArea={selectedArea}
                      selectedMeetingPointIds={selectedMeetingPointIds}
                      availableMeetingPoints={availableMeetingPoints}
                      toGIU={toGIU}
                      girlsOnly={girlsOnly}
                      onAreaChange={handleAreaChange}
                      onMeetingPointSelect={handleMeetingPointSelect}
                      onMeetingPointRemove={handleRemoveMeetingPoint}
                      getRemainingMeetingPoints={getRemainingMeetingPoints}
                      onToGIUChange={handleToGIUChange}
                      onGirlsOnlyChange={setGirlsOnly}
                      onContinue={handleContinueToPrice}
                      departureTime={departureTime}
                      onDepartureTimeChange={setDepartureTime}
                    />
                  ) : (
                    <PricingForm 
                      selectedMeetingPointIds={selectedMeetingPointIds}
                      availableMeetingPoints={availableMeetingPoints}
                      meetingPointPrices={meetingPointPrices}
                      onPriceChange={handlePriceChange}
                      onBack={() => setCurrentStep('details')}
                      onSubmit={handleContinueToVerification}
                    />
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                <CreateRideMap selectedAreaId={selectedAreaId} selectedMeetingPointIds={selectedMeetingPointIds} toGIU={toGIU} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}