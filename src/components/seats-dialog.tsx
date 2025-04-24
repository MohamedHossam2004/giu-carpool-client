"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"

interface Seat {
  id: string
  name: string
  price: number
  currency: string
  selected: boolean
}

interface SeatsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (selectedSeats: Seat[]) => void
}

export function SeatsDialog({ open, onOpenChange, onConfirm }: SeatsDialogProps) {
  const [seats, setSeats] = useState<Seat[]>([
    { id: "front", name: "Front Seat", price: 100, currency: "EGP", selected: false },
    { id: "back-left", name: "Back Left", price: 70, currency: "EGP", selected: false },
    { id: "back-right", name: "Back Right", price: 70, currency: "EGP", selected: false },
    { id: "back-middle", name: "Back Middle", price: 60, currency: "EGP", selected: false },
  ])

  const handleSeatToggle = (id: string) => {
    setSeats(seats.map((seat) => (seat.id === id ? { ...seat, selected: !seat.selected } : seat)))
  }

  const handleConfirm = () => {
    onConfirm(seats.filter((seat) => seat.selected))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 flex flex-row items-start justify-between">
          <DialogTitle className="text-xl font-bold">Available Seats</DialogTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="px-6 pb-2">
          <p className="text-sm text-muted-foreground">Select Needed Seats</p>
        </div>

        <div className="px-6 py-2">
          <ul className="space-y-4">
            {seats.map((seat) => (
              <li key={seat.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{seat.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {seat.currency} {seat.price}
                  </p>
                </div>
                <Checkbox
                  id={seat.id}
                  checked={seat.selected}
                  onCheckedChange={() => handleSeatToggle(seat.id)}
                  className="h-5 w-5 rounded-sm border-gray-300 data-[state=checked]:bg-gray-200 data-[state=checked]:text-gray-900"
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 pt-2">
          <Button onClick={handleConfirm} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
