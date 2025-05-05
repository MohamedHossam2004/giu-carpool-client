"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { LoaderCircle, MapPin } from "lucide-react"

interface MeetingPoint {
    meetingPoint: {
        name: string
        id: number
    }
    price: number
}

interface MeetingPointsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    meetingPoints: MeetingPoint[]
    onConfirm: (selectedMeetingPoint: MeetingPoint) => void
    rideId: string
}

export function MeetingPointsDialog({
    open,
    onOpenChange,
    meetingPoints,
    onConfirm,
    rideId,
}: MeetingPointsDialogProps) {
    const [selectedMeetingPoint, setSelectedMeetingPoint] = useState<MeetingPoint | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleConfirm = async () => {
        if (!selectedMeetingPoint) return

        setIsSubmitting(true)

        try {

            // await fetch('/api/join-ride', {
            //   method: 'POST',
            //   body: JSON.stringify({
            //     rideId,
            //     meetingPointName: selectedMeetingPoint.meetingPoint.name,
            //     price: selectedMeetingPoint.price
            //   })
            // })

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            onConfirm(selectedMeetingPoint)
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to join ride:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Select Meeting Point</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-4">Please select one of the available meeting points:</p>

                    <RadioGroup
                        value={
                            selectedMeetingPoint ? `${selectedMeetingPoint.meetingPoint.name}-${selectedMeetingPoint.price}` : ""
                        }
                        onValueChange={(value: any) => {
                            const [name, priceStr] = value.split("-")
                            const price = Number.parseFloat(priceStr)
                            const meetingPoint = meetingPoints.find((mp) => mp.meetingPoint.name === name && mp.price === price)
                            if (meetingPoint) {
                                setSelectedMeetingPoint(meetingPoint)
                            }
                        }}
                        className="space-y-3"
                    >
                        {meetingPoints.map((mp, index) => (
                            <div
                                key={`${mp.meetingPoint.name}-${mp.price}-${index}`}
                                className="flex items-center justify-between space-x-2 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value={`${mp.meetingPoint.name}-${mp.price}`}
                                        id={`${mp.meetingPoint.name}-${mp.price}-${index}`}
                                    />
                                    <Label
                                        htmlFor={`${mp.meetingPoint.name}-${mp.price}-${index}`}
                                        className="flex items-center cursor-pointer"
                                    >
                                        <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                                        <span>{mp.meetingPoint.name}</span>
                                    </Label>
                                </div>
                                <div className="font-medium text-orange-500">{mp.price} EGP</div>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <DialogFooter className="sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="bg-orange-400 hover:bg-orange-500 text-white"
                        onClick={handleConfirm}
                        disabled={!selectedMeetingPoint || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Joining...
                            </>
                        ) : (
                            "Confirm"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
