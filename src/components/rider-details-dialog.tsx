"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Star, StarHalf } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// These interfaces match the GraphQL schema
interface RideReview {
    id: string
    driverId: string
    riderId: string
    rating: number
    review: string | null
    createdAt: string
}

interface DriverRating {
    averageRating: number
    reviewCount: number
}

interface RiderDetailsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    driverId: string
    driverName: string
    driverAvatar?: string
}

export function RiderDetailsDialog({
    open,
    onOpenChange,
    driverId,
    driverName,
    driverAvatar,
}: RiderDetailsDialogProps) {
    const [reviews, setReviews] = useState<RideReview[]>([])
    const [rating, setRating] = useState<DriverRating>({ averageRating: 0, reviewCount: 0 })
    const [loading, setLoading] = useState(true)

    // Mock data fetching - in a real app, this would be a GraphQL query
    useEffect(() => {
        if (open) {
            // Simulate API call delay
            const timer = setTimeout(() => {
                // Mock data that matches the schema
                setRating({
                    averageRating: 4.7,
                    reviewCount: 23,
                })

                setReviews([
                    {
                        id: "1",
                        driverId: driverId,
                        riderId: "101",
                        rating: 5,
                        review: "Great driver! Very punctual and friendly.",
                        createdAt: "2023-04-15T10:30:00Z",
                    },
                    {
                        id: "2",
                        driverId: driverId,
                        riderId: "102",
                        rating: 5,
                        review: "Always on time and very professional. The car was clean and comfortable.",
                        createdAt: "2023-03-22T14:15:00Z",
                    },
                    {
                        id: "3",
                        driverId: driverId,
                        riderId: "103",
                        rating: 4,
                        review: "Good experience overall. Would ride again.",
                        createdAt: "2023-02-10T09:45:00Z",
                    },
                ])

                setLoading(false)
            }, 500)

            return () => clearTimeout(timer)
        }
    }, [open, driverId])

    // Format date to a more readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // Render stars based on rating
    const renderStars = (rating: number) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-amber-500 text-amber-500" />)
        }

        if (hasHalfStar) {
            stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-amber-500 text-amber-500" />)
        }

        const emptyStars = 5 - stars.length
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-gray-300" />)
        }

        return stars
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-lg p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-2 flex flex-row items-start justify-between">
                    <DialogTitle className="text-xl font-bold">Rider Details</DialogTitle>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onOpenChange(false)}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </DialogHeader>

                <div className="px-6 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16 border">
                            <AvatarImage src={driverAvatar || "/placeholder.svg?height=64&width=64"} alt={driverName} />
                            <AvatarFallback>{driverName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-semibold">{driverName}</h3>
                            <div className="flex items-center gap-1 mt-1">
                                {!loading && renderStars(rating.averageRating)}
                                <span className="text-sm text-muted-foreground ml-1">({rating.averageRating.toFixed(1)})</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {!loading ? `${rating.reviewCount} reviews` : "Loading..."}
                            </p>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                        <h4 className="font-medium mb-3">Reviews</h4>
                        {loading ? (
                            <p className="text-sm text-muted-foreground">Loading reviews...</p>
                        ) : reviews.length > 0 ? (
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                {reviews.map((review) => (
                                    <div key={review.id} className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium text-sm">Rider {review.riderId}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                                        <p className="text-sm mt-1">{review.review}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No reviews yet</p>
                        )}
                    </div>
                </div>

                <div className="p-6 pt-2">
                    <Button onClick={() => onOpenChange(false)} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
