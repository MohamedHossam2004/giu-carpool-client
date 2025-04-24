import { Button } from "@/components/ui/button"
import { Area, MeetingPoint } from "@/types/area"
import { Clock, MapPin, Users, ArrowRight, ArrowLeft } from "lucide-react"
import { format } from "date-fns"

interface VerificationFormProps {
  selectedArea: Area | null
  selectedMeetingPointIds: string[]
  availableMeetingPoints: MeetingPoint[]
  meetingPointPrices: { [key: string]: number }
  toGIU: boolean
  girlsOnly: boolean
  departureTime: string
  onBack: () => void
  onSubmit: () => void
}

export function VerificationForm({
  selectedArea,
  selectedMeetingPointIds,
  availableMeetingPoints,
  meetingPointPrices,
  toGIU,
  girlsOnly,
  departureTime,
  onBack,
  onSubmit
}: VerificationFormProps) {
  // Get the selected meeting points with their names
  const selectedMeetingPoints = selectedMeetingPointIds.map(id => {
    const point = availableMeetingPoints.find(p => p.id.toString() === id);
    return {
      id,
      name: point?.name || 'Unknown Meeting Point',
      price: meetingPointPrices[id] || 0
    };
  });


  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-black">Verify Ride Details</h2>
      
      {/* Area and Route */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-black">Route Information</h3>
        <div className="rounded-lg border border-gray-200 p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-orange-500" />
            <span className="font-medium text-black">{selectedArea?.name || 'No area selected'}</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-black">
                {departureTime ? format(new Date(departureTime), 'MMM dd, yyyy HH:mm') : 'No time selected'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className={`h-4 w-4 ${toGIU ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm text-black">{toGIU ? 'To GIU' : 'From GIU'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className={`h-4 w-4 ${girlsOnly ? 'text-pink-500' : 'text-gray-400'}`} />
              <span className="text-sm text-black">{girlsOnly ? 'Girls Only' : 'Mixed Ride'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Points */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-black">Meeting Points</h3>
        <div className="rounded-lg border border-gray-200 p-4 bg-white">
          <div className="space-y-3">
            {selectedMeetingPoints.map((point, index) => (
              <div key={point.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-500 text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-black">{point.name}</span>
                </div>
                <span className="font-medium text-black">EGP {point.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          className="border-gray-300 text-black"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={onSubmit}
        >
          Create Ride
        </Button>
      </div>
    </div>
  )
}