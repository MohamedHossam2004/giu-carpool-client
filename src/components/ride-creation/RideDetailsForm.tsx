import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { EnhancedToggleSwitch } from "./EnhancedToggleSwitch"
import { MeetingPointSelector } from "./MeetingPointSelector"
import { Area, MeetingPoint } from "@/types/area"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { format, addDays, isBefore, isAfter } from "date-fns"

interface RideDetailsFormProps {
  areas: Area[]
  selectedAreaId: string
  selectedArea: Area | null
  selectedMeetingPointIds: string[]
  availableMeetingPoints: MeetingPoint[]
  toGIU: boolean
  girlsOnly: boolean
  onAreaChange: (areaId: string) => void
  onMeetingPointSelect: (index: number, pointId: string) => void
  onMeetingPointRemove: (index: number) => void
  getRemainingMeetingPoints: (index: number) => MeetingPoint[]
  onToGIUChange: (checked: boolean) => void
  onGirlsOnlyChange: (checked: boolean) => void
  onContinue: () => void
  departureTime: string
  onDepartureTimeChange: (time: string) => void
}

export function RideDetailsForm({
  areas,
  selectedAreaId,
  selectedArea,
  selectedMeetingPointIds,
  availableMeetingPoints,
  toGIU,
  girlsOnly,
  onAreaChange,
  onMeetingPointSelect,
  onMeetingPointRemove,
  getRemainingMeetingPoints,
  onToGIUChange,
  onGirlsOnlyChange,
  onContinue,
  departureTime,
  onDepartureTimeChange
}: RideDetailsFormProps) {
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-black">Pickup Route:</h2>
        <Select onValueChange={onAreaChange}>
          <SelectTrigger className="bg-white text-black border-gray-200">
            <SelectValue placeholder="Select route" />
          </SelectTrigger>
          <SelectContent className="text-black bg-white">
            {areas.map((area) => (
              <SelectItem key={area.id} value={area.id} disabled={!area.isActive}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedArea && (
        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            (index === 0 || (selectedMeetingPointIds[index - 1] && getRemainingMeetingPoints(index).length > 0)) && (
              <MeetingPointSelector
                key={index}
                index={index}
                selectedMeetingPointIds={selectedMeetingPointIds}
                availableMeetingPoints={availableMeetingPoints}
                onSelect={onMeetingPointSelect}
                onRemove={onMeetingPointRemove}
                getRemainingMeetingPoints={getRemainingMeetingPoints}
              />
            )
          ))}
        </div>
      )}

      <div className="space-y-5 pt-4 bg-white text-black">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-black">Departure Time:</h2>
          <div className="flex flex-col space-y-2">
            <Input 
              type="datetime-local" 
              value={departureTime}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                const now = new Date();
                const maxDate = addDays(now, 2);
                
                if (isBefore(selectedDate, now)) {
                  alert("Cannot select a time in the past");
                  return;
                }
                
                if (isAfter(selectedDate, maxDate)) {
                  alert("Cannot select a time more than 2 days ahead");
                  return;
                }
                
                onDepartureTimeChange(e.target.value);
              }}
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              max={format(addDays(new Date(), 2), "yyyy-MM-dd'T'HH:mm")}
              className="bg-white text-black border-gray-200"
            />
            <p className="text-xs text-gray-500">You can only select a time between now and 2 days ahead</p>
          </div>
        </div>
        
        <EnhancedToggleSwitch
          id="to-giu"
          label="To GIU"
          checked={toGIU}
          onCheckedChange={onToGIUChange}
        />
        <EnhancedToggleSwitch
          id="girls-only"
          label="Girls Only"
          checked={girlsOnly}
          onCheckedChange={onGirlsOnlyChange}
        />
      </div>

      <div className="flex justify-end mt-6">
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={onContinue}
          disabled={selectedMeetingPointIds.length === 0 || !departureTime}
        >
          Continue
        </Button>
      </div>
    </>
  )
}