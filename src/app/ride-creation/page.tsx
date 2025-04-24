"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, gql } from "@apollo/client"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import CreateRideMap from "./CreateRideMap"
import { AlertCircle } from "lucide-react"
import Cookies from 'js-cookie'
import { Area } from "../../types/area"
import { ME_QUERY } from "@/lib/graphql/queries"

export default function CreateRidePage() {
  const router = useRouter();
  const [toGIU, setToGIU] = useState(true)
  const [girlsOnly, setGirlsOnly] = useState(false)
  const [selectedAreaId, setSelectedAreaId] = useState<string>("")
  const [selectedMeetingPointIds, setSelectedMeetingPointIds] = useState<string[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const accessToken = Cookies.get('accessToken');
  const { data, loading: authLoading, error: authError } = useQuery(ME_QUERY, {
    context: {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }
  });

  console.log("Access Token:", accessToken);

  // !!!!there is error here when i print (i cant fix it because i dont know what is the error)
  console.log("Auth Error:", authError);

  useEffect(() => {
    // add || authError in the condition when it is fixed  
    if (!accessToken) {
      router.push('/login');
      return;
    }
  
    fetchAreas();
  }, [data, authError, router, accessToken]);


  const fetchAreas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
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
      console.log('GraphQL Response:', result);

      if (!response.ok) {
        throw new Error(result.errors ? result.errors[0].message : response.statusText);
      }

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data || !result.data.getAreas) {
        throw new Error('No areas data received');
      }

      setAreas(result.data.getAreas);
    } catch (error) {
      console.error('Error fetching areas:', error);
      console.log('Access Token used:', accessToken);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching areas');
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
    const area = areas.find(a => a.id === areaId);
    setSelectedArea(area || null);
    setSelectedMeetingPointIds([]); // Reset meeting point selection
  };

  const handleMeetingPointToggle = (pointId: string) => {
    setSelectedMeetingPointIds(prev => {
      if (prev.includes(pointId)) {
        return prev.filter(id => id !== pointId);
      } else {
        return [...prev, pointId];
      }
    });
  };

  if (loading || authLoading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 animate-ping"></div>
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
          <div className="w-[450px] p-6 border-r overflow-y-auto">
            <h1 className="text-2xl font-bold mb-6 text-black">Create Ride</h1>
            <div className="h-1 w-full bg-primary mb-8"></div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-black">Pickup Route:</h2>
                <Select onValueChange={handleAreaChange}>
                  <SelectTrigger className="bg-white text-black border-gray-200">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent className="text-black bg-white">
                    {areas.map((area) => (
                      <SelectItem 
                        key={area.id} 
                        value={area.id}
                        disabled={!area.isActive}
                      >
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedArea && (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-black">Meeting Points:</h2>
                  <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                    {selectedArea.meetingPoints.map((point) => (
                      <div key={point.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`point-${point.id}`}
                          checked={selectedMeetingPointIds.includes(point.id.toString())}
                          onChange={() => handleMeetingPointToggle(point.id.toString())}
                          disabled={!point.isActive}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label 
                          htmlFor={`point-${point.id}`}
                          className={`text-sm ${!point.isActive ? 'text-gray-400' : 'text-gray-700'}`}
                        >
                          {point.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 bg-white text-black">
                <div className="flex items-center justify-between bg-white text-black">
                  <Label htmlFor="to-giu" className="font-medium bg-white text-black">
                    To GIU
                  </Label>
                  <Switch id="to-giu" checked={toGIU} onCheckedChange={setToGIU} className="bg-gray-300"/>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="girls-only" className="font-medium">
                    Girls Only
                  </Label>
                  <Switch id="girls-only" checked={girlsOnly} onCheckedChange={setGirlsOnly} className="bg-gray-300"/>
                </div>
              </div>

              <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-6">Continue</Button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex-1 relative">
            <CreateRideMap 
              selectedAreaId={selectedAreaId} 
              selectedMeetingPointIds={selectedMeetingPointIds}
              toGIU={toGIU}
            />
          </div>
        </main>
      </div>
    </div>
  )
} 