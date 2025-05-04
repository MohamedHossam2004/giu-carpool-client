"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "@apollo/client"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"
import { ridesClient } from "@/lib/apollo-client"
import Cookies from "js-cookie"
import { Card } from "@/components/ui/card"
import { AreaForm } from "@/components/areas/AreaForm"
import { MeetingPointForm } from "@/components/areas/MeetingPointForm"
import { AreaSelect } from "@/components/areas/AreaSelect"
import { Map } from "@/components/areas/Map"
import { ModeSwitcher } from "@/components/areas/ModeSwitcher"
import { GET_AREAS, CREATE_AREA_MUTATION, CREATE_MEETING_POINT_MUTATION, DELETE_AREA_MUTATION, DELETE_MEETING_POINT_MUTATION, ME_QUERY } from "@/lib/graphql/queries"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

type Mode = 'area' | 'meeting-point';

export default function AddAreaPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('area');
  const [selectedAreaId, setSelectedAreaId] = useState<string>("")
  const [selectedAreaName, setSelectedAreaName] = useState<string>("")
  const [areaName, setAreaName] = useState("")
  const [areaActive, setAreaActive] = useState(true)
  const [point, setPoint] = useState({ name: "", lat: "", long: "", isActive: true })
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const accessToken = Cookies.get("accessToken")
 
  // Check authentication and admin status is missing


// iam not an admin therefore i comment this out
//   // Redirect if not admin
//   useEffect(() => {
//     if (!userLoading && userData?.me) {

//     //   if (!userData.me.isAdmin) {
//     //     setError("You don't have permission to access this page")
//     //     router.push('/')
//     //   }
//     }
//   }, [userData, userLoading, router])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  // Reset form when switching modes
  useEffect(() => {
    if (mode === 'area') {
      setPoint({ name: "", lat: "", long: "", isActive: true });
      setSelectedLocation(null);
    } else {
      setAreaName("");
      setAreaActive(true);
    }
  }, [mode]);

  // Fetch existing areas
  const { data: areasData, loading: areasLoading } = useQuery(GET_AREAS, {
    client: ridesClient,
    context: {
      headers: { authorization: `Bearer ${accessToken}` },
    },
  })

  const [createArea] = useMutation(CREATE_AREA_MUTATION, {
    client: ridesClient,
    context: {
      headers: { authorization: `Bearer ${accessToken}` },
    },
    refetchQueries: ['GetAreas'],
    onCompleted: (data) => {
      if (data?.createAreaWithMeetingPoints) {
        setSelectedAreaId(data.createAreaWithMeetingPoints.id)
        setSelectedAreaName(data.createAreaWithMeetingPoints.name)
        setSuccess(`Area "${data.createAreaWithMeetingPoints.name}" created successfully!`)
        setAreaName("")
        // Switch to meeting point mode after creating area
        setMode('meeting-point')
      }
    },
    onError: (error) => {
      console.error("Error creating area:", error)
      if (error.message.includes("already exists")) {
        setError(`An area with the name "${areaName}" already exists. Please choose a different name.`)
      } else if (error.message.includes("name")) {
        setError("Please provide a valid area name.")
      } else {
        setError("Failed to create area. Please try again.")
      }
    }
  })

  const [createPoint] = useMutation(CREATE_MEETING_POINT_MUTATION, {
    client: ridesClient,
    context: {
      headers: { authorization: `Bearer ${accessToken}` },
    },
    refetchQueries: ['GetAreas'],
    onCompleted: (data) => {
      if (data?.createMeetingPoint) {
        setSuccess(`Meeting point "${data.createMeetingPoint.name}" created successfully in area "${data.createMeetingPoint.area.name}"!`)
        setPoint({ name: "", lat: "", long: "", isActive: true })
        setSelectedLocation(null)
      }
    },
    onError: (error) => {
      console.error("Error creating meeting point:", error)
      if (error.message.includes("name")) {
        setError("Please provide a valid meeting point name.")
      } else if (error.message.includes("coordinates")) {
        setError("Please select a valid location on the map.")
      } else if (error.message.includes("area")) {
        setError("Invalid area selected. Please try again.")
      } else if (error.message.includes("already exists")) {
        setError(`A meeting point with the name "${point.name}" already exists in this area.`)
      } else if (error.message.includes("required")) {
        setError("All fields are required. Please fill in all the information.")
      } else {
        setError("Failed to create meeting point. Please try again.")
      }
    }
  })

  const [deleteArea] = useMutation(DELETE_AREA_MUTATION, {
    client: ridesClient,
    context: {
      headers: { authorization: `Bearer ${accessToken}` },
    },
    refetchQueries: ['GetAreas'],
    onCompleted: () => {
      setSuccess("Area deleted successfully!")
      setSelectedAreaId("")
      setSelectedAreaName("")
      setMode('area')
    },
    onError: (error) => {
      console.error("Error deleting area:", error)
      setError("Failed to delete area. Please try again.")
    }
  })

  const [deleteMeetingPoint] = useMutation(DELETE_MEETING_POINT_MUTATION, {
    client: ridesClient,
    context: {
      headers: { authorization: `Bearer ${accessToken}` },
    },
    refetchQueries: ['GetAreas'],
    onCompleted: () => {
      setSuccess("Meeting point deleted successfully!")
    },
    onError: (error) => {
      console.error("Error deleting meeting point:", error)
      setError("Failed to delete meeting point. Please try again.")
    }
  })

  const handleCreateArea = () => {
    // Clear any existing errors
    setError(null)
    
    // Validate area name
    if (!areaName.trim()) {
      setError("Please enter an area name")
      return
    }

    // Check if area name already exists in the list
    const existingArea = areasData?.getAreas?.find(
      (area: any) => area.name.toLowerCase() === areaName.trim().toLowerCase()
    )
    if (existingArea) {
      setError(`An area with the name "${areaName}" already exists. Please choose a different name.`)
      return
    }

    try {
      createArea({ 
        variables: { 
          input: {
            name: areaName.trim(),
            isActive: areaActive,
            meetingPoints: []
          }
        } 
      })
    } catch (err) {
      console.error("Error in handleCreateArea:", err)
      setError("An unexpected error occurred. Please try again.")
    }
  }

  const handleCreatePoint = () => {
    // Clear any existing errors
    setError(null)

    // Validate area selection
    if (!selectedAreaId) {
      setError("Please select or create an area first")
      return
    }

    // Validate point name
    if (!point.name.trim()) {
      setError("Please enter a meeting point name")
      return
    }

    // Check if point name already exists in the selected area
    const selectedArea = areasData?.getAreas?.find((area: any) => area.id === selectedAreaId)
    const existingPoint = selectedArea?.meetingPoints?.find(
      (mp: any) => mp.name.toLowerCase() === point.name.trim().toLowerCase()
    )
    if (existingPoint) {
      setError(`A meeting point with the name "${point.name}" already exists in this area.`)
      return
    }

    // Validate location selection
    if (!selectedLocation) {
      setError("Please select a location on the map")
      return
    }

    // Validate coordinates
    const latitude = parseFloat(point.lat)
    const longitude = parseFloat(point.long)
    if (isNaN(latitude) || isNaN(longitude)) {
      setError("Invalid coordinates. Please select a location on the map.")
      return
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      setError("Invalid latitude. Must be between -90 and 90 degrees.")
      return
    }
    if (longitude < -180 || longitude > 180) {
      setError("Invalid longitude. Must be between -180 and 180 degrees.")
      return
    }

    try {
      createPoint({
        variables: {
          areaId: selectedAreaId,
          input: {
            name: point.name.trim(),
            latitude,
            longitude,
            isActive: point.isActive
          }
        },
        refetchQueries: ['GetAreas']
      })
    } catch (err) {
      console.error("Error in handleCreatePoint:", err)
      setError("An unexpected error occurred. Please try again.")
    }
  }

  const handleAreaSelect = (areaId: string) => {
    const selectedArea = areasData?.getAreas?.find((area: any) => area.id === areaId)
    if (selectedArea) {
      setSelectedAreaId(areaId)
      setSelectedAreaName(selectedArea.name)
      // Switch to meeting point mode when area is selected
      setMode('meeting-point')
    }
  }

  const handleLocationSelect = (lat: string, long: string, name?: string) => {
    setSelectedLocation([parseFloat(long), parseFloat(lat)])
    
    // Always update coordinates and name based on mode
    if (mode === 'area') {
      setAreaName(name || '')
    } else if (mode === 'meeting-point') {
      setPoint(prev => ({
        ...prev,
        lat,
        long,
        name: name || prev.name // Use the location name if available, otherwise keep existing name
      }))
    }
  }

  // Get existing points for selected area
  const selectedAreaPoints = areasData?.getAreas?.find(
    (area: any) => area.id === selectedAreaId
  )?.meetingPoints || [];

  const handleDeleteArea = async () => {
    if (!selectedAreaId) return
    
    if (window.confirm("Are you sure you want to delete this area? This will also delete all meeting points in this area.")) {
      try {
        await deleteArea({ variables: { id: selectedAreaId } })
      } catch (err) {
        console.error("Error in handleDeleteArea:", err)
      }
    }
  }

  const handleDeleteMeetingPoint = async (pointId: string) => {
    if (!pointId) return
    
    if (window.confirm("Are you sure you want to delete this meeting point?")) {
      try {
        await deleteMeetingPoint({ variables: { id: pointId } })
      } catch (err) {
        console.error("Error in handleDeleteMeetingPoint:", err)
      }
    }
  }

  // Show loading state
  if (areasLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Show error if not admin
  if (error && error.includes("don't have permission")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Forms */}
            <div className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              <Card className="p-6">
                <ModeSwitcher mode={mode} onModeChange={setMode} />
                
                {mode === 'area' ? (
                  <div className="space-y-4">
                    <AreaForm
                      areaName={areaName}
                      setAreaName={setAreaName}
                      areaActive={areaActive}
                      setAreaActive={setAreaActive}
                      onCreateArea={handleCreateArea}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AreaSelect
                      selectedAreaId={selectedAreaId}
                      onAreaSelect={handleAreaSelect}
                      areas={areasData?.getAreas || []}
                      onDeleteArea={handleDeleteArea}
                    />
                    {selectedAreaId && (
                      <MeetingPointForm
                        selectedAreaName={selectedAreaName}
                        point={point}
                        setPoint={setPoint}
                        onCreatePoint={handleCreatePoint}
                        existingPoints={selectedAreaPoints}
                        onDeletePoint={handleDeleteMeetingPoint}
                      />
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Right side - Map */}
            <Map 
              onLocationSelect={handleLocationSelect}
              selectedAreaName={selectedAreaName}
              existingPoints={selectedAreaPoints}
              selectedAreaId={selectedAreaId}
              mode={mode}
            />
          </div>
        </main>
      </div>
    </div>
  )
} 