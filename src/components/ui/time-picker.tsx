"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface TimePickerProps {
    setTime: (time: string) => void
    initialTime?: string
    className?: string
}

export function TimePicker({ setTime, initialTime = "12:00", className }: TimePickerProps) {
    const [hours, setHours] = useState<number>(0)
    const [minutes, setMinutes] = useState<number>(0)
    const [period, setPeriod] = useState<"AM" | "PM">("AM")

    // Parse initial time on mount
    useEffect(() => {
        if (initialTime) {
            const [hoursStr, minutesStr] = initialTime.split(":")
            let parsedHours = Number.parseInt(hoursStr, 10)
            const parsedMinutes = Number.parseInt(minutesStr, 10)

            // Convert 24-hour format to 12-hour format
            const newPeriod = parsedHours >= 12 ? "PM" : "AM"
            if (parsedHours > 12) parsedHours -= 12
            if (parsedHours === 0) parsedHours = 12

            setHours(parsedHours)
            setMinutes(parsedMinutes)
            setPeriod(newPeriod)
        }
    }, [initialTime])

    // Update the time whenever hours, minutes, or period changes
    useEffect(() => {
        // Convert back to 24-hour format
        let hours24 = hours
        if (period === "PM" && hours !== 12) hours24 += 12
        if (period === "AM" && hours === 12) hours24 = 0

        const timeString = `${hours24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
        setTime(timeString)
    }, [hours, minutes, period, setTime])

    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(e.target.value, 10)
        if (!isNaN(value) && value >= 1 && value <= 12) {
            setHours(value)
        }
    }

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(e.target.value, 10)
        if (!isNaN(value) && value >= 0 && value <= 59) {
            setMinutes(value)
        }
    }

    const togglePeriod = () => {
        setPeriod((prev) => (prev === "AM" ? "PM" : "AM"))
    }

    return (
        <div className={cn("grid gap-4", className)}>
            <div className="flex items-center justify-between">
                <div className="grid gap-1">
                    <Label htmlFor="hours" className="text-xs">
                        Hours
                    </Label>
                    <Input
                        id="hours"
                        className="w-16 text-center"
                        value={hours}
                        onChange={handleHoursChange}
                        type="number"
                        min={1}
                        max={12}
                    />
                </div>
                <div className="text-center text-2xl">:</div>
                <div className="grid gap-1">
                    <Label htmlFor="minutes" className="text-xs">
                        Minutes
                    </Label>
                    <Input
                        id="minutes"
                        className="w-16 text-center"
                        value={minutes}
                        onChange={handleMinutesChange}
                        type="number"
                        min={0}
                        max={59}
                    />
                </div>
                <div className="grid gap-1">
                    <Label htmlFor="period" className="text-xs">
                        AM/PM
                    </Label>
                    <Button id="period" variant="outline" onClick={togglePeriod} className="w-16">
                        {period}
                    </Button>
                </div>
            </div>
            <div className="flex justify-end">
                <Button
                    variant="default"
                    onClick={() => {
                        // This will trigger the useEffect to update the time
                    }}
                >
                    Set Time
                </Button>
            </div>
        </div>
    )
}
