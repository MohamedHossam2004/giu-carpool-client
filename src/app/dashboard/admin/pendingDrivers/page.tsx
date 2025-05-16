'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { gql } from '@apollo/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Cookies from 'js-cookie'

const PENDING_DRIVERS_QUERY = gql`
  query {
    pendingDrivers {
      id
      email
      firstName
      lastName
      phone
      giuId
      gender
      isAdmin
      isEmailVerified
      isDeleted
      activated
      isDriver
      createdAt
      updatedAt
      driver {
        id
        userId
        approved
        car {
          id
          licensePlate
          year
          vehicleName
          passengerSeats
          licensePicture
          driverId
        }
      }
    }
  }
`

const ACTIVATE_DRIVER_MUTATION = gql`
  mutation {
    activateDriver(userId: $userId) {
      id
      userId
      approved
      car {
        id
        licensePlate
        year
        vehicleName
        passengerSeats
        licensePicture
      }
    }
  }
`

export default function PendingDriversPage() {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
  const accessToken = Cookies.get('accessToken')
  const { loading, error, data, refetch } = useQuery(PENDING_DRIVERS_QUERY, {
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
  const [activateDriver] = useMutation(ACTIVATE_DRIVER_MUTATION, {
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })

  const handleViewLicense = async (userId: string) => {
    try {
      const response = await fetch(`https://3.84.209.34/admin/download-license?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch license')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      toast.error('Failed to view license')
    }
  }

  const handleApproveDriver = async (userId: number) => {
    try {
      const response = await fetch('https://3.84.209.34/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          query: `mutation { activateDriver(userId: ${userId}) { id userId approved car { id licensePlate year vehicleName passengerSeats licensePicture } } }`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve driver');
      }

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      toast.success('Driver approved successfully');
      refetch();
      window.location.reload();
    } catch (error) {
      toast.error('Failed to approve driver');
      console.error('Error:', error);
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pending Drivers</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.pendingDrivers.map((driver: any) => (
          <Card key={driver.id}>
            <CardHeader>
              <CardTitle>
                {driver.firstName} {driver.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <p className="font-medium">Personal Information</p>
                <p>Email: {driver.email}</p>
                <p>Phone: {driver.phone}</p>
                <p>GIU ID: {driver.giuId}</p>
                <p>Gender: {driver.gender ? 'Male' : 'Female'}</p>
                <p>Status: {driver.activated ? 'Activated' : 'Not Activated'}</p>
                <p>Email Verified: {driver.isEmailVerified ? 'Yes' : 'No'}</p>
              </div>

              <div className="space-y-1">
                <p className="font-medium">Vehicle Information</p>
                <p>Vehicle: {driver.driver?.car?.vehicleName}</p>
                <p>Year: {driver.driver?.car?.year}</p>
                <p>License Plate: {driver.driver?.car?.licensePlate}</p>
                <p>Passenger Seats: {driver.driver?.car?.passengerSeats}</p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleViewLicense(driver.id)}
                >
                  View License
                </Button>
                <Button
                  onClick={() => handleApproveDriver(parseInt(driver.driver.id))}
                >
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 