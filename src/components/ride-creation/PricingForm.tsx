import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MeetingPoint } from "@/types/area"

interface PricingFormProps {
  selectedMeetingPointIds: string[]
  availableMeetingPoints: MeetingPoint[]
  meetingPointPrices: { [key: string]: number }
  onPriceChange: (pointId: string, price: number) => void
  onBack: () => void
  onSubmit: () => void
}

export function PricingForm({
  selectedMeetingPointIds,
  availableMeetingPoints,
  meetingPointPrices,
  onPriceChange,
  onBack,
  onSubmit
}: PricingFormProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-black">Set Price for Each Meeting Point:</h2>
      {selectedMeetingPointIds.map((pointId, index) => {
        const meetingPoint = availableMeetingPoints.find((p) => p.id.toString() === pointId);
        return (
          <div key={pointId} className="space-y-2">
            <Label className="text-sm font-medium text-black">
              {meetingPoint?.name || `Meeting Point ${index + 1}`}
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-black font-medium">EGP</span>
              <Input
                type="number"
                min="0"
                step="5"
                value={meetingPointPrices[pointId] || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  onPriceChange(pointId, Number.isNaN(value) ? 0 : value);
                }}
                className="bg-white text-black border-gray-200"
              />
            </div>
          </div>
        );
      })}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          className="border-gray-300 text-black"
          onClick={onBack}
        >
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