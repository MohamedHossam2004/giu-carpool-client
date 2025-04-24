import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MeetingPoint } from "@/types/area"

interface MeetingPointSelectorProps {
  index: number
  selectedMeetingPointIds: string[]
  availableMeetingPoints: MeetingPoint[]
  onSelect: (index: number, pointId: string) => void
  onRemove: (index: number) => void
  getRemainingMeetingPoints: (index: number) => MeetingPoint[]
}

export function MeetingPointSelector({
  index,
  selectedMeetingPointIds,
  availableMeetingPoints,
  onSelect,
  onRemove,
  getRemainingMeetingPoints
}: MeetingPointSelectorProps) {
  const stopLabels = ['First', 'Second', 'Third']
  const placeholderLabels = ['first', 'second', 'third']
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium text-black">{stopLabels[index]} Stop</Label>
        {selectedMeetingPointIds.length > index && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 h-6 px-2 flex items-center gap-1"
            onClick={() => onRemove(index)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Remove
          </Button>
        )}
      </div>
      <Select
        onValueChange={(value) => onSelect(index, value)}
        value={selectedMeetingPointIds[index] || ""}
      >
        <SelectTrigger className="bg-white text-black border-gray-200">
          <SelectValue placeholder={`Select ${placeholderLabels[index]} meeting point`} />
        </SelectTrigger>
        <SelectContent className="text-black bg-white">
          {getRemainingMeetingPoints(index).map((point) => (
            <SelectItem
              key={point.id}
              value={point.id.toString()}
              disabled={!point.isActive}
            >
              {point.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}