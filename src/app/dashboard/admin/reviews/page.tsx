'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { ridesClient } from '@/lib/apollo-client'

const GET_ALL_REVIEWS_QUERY = gql`
  query {
    getAllReviews {
      id
      driverId
      riderId
      rating
      review
      createdAt
      ride {
        id
        area {
          name
        }
      }
    }
  }
`

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [ratingFilter, setRatingFilter] = useState('all')
  const accessToken = Cookies.get('accessToken')

  const { loading, error, data } = useQuery(GET_ALL_REVIEWS_QUERY, {
    client: ridesClient,
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const filteredReviews = data?.getAllReviews
    ?.filter((review: any) => {
      const matchesSearch = 
        review.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.ride.area.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRating = 
        ratingFilter === 'all' || 
        review.rating.toString() === ratingFilter

      return matchesSearch && matchesRating
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortBy === 'highest') {
        return b.rating - a.rating
      } else {
        return a.rating - b.rating
      }
    })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Reviews Management</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search reviews or areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReviews?.map((review: any) => (
          <Card key={review.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>Rating: {review.rating}/5</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <p className="font-medium">Review Details</p>
                <p>{review.review}</p>
                <p className="text-sm text-gray-500">
                  Area: {review.ride.area.name}
                </p>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Driver ID: {review.driverId}</span>
                <span>Rider ID: {review.riderId}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 