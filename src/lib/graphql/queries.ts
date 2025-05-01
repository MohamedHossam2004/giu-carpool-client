import { gql } from "@apollo/client"

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      giuId
      phone
      gender
      isAdmin
      isEmailVerified
      activated
      isDriver
      createdAt
      updatedAt
      driver {
        id
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
  }
`

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser {
    deleteUser {
      message
    }
  }
`

export const GET_DRIVER_AVERAGE_RATING = gql`
  query GetDriverAverageRating($driverId: ID!) {
    getDriverAverageRating(driverId: $driverId) {
      averageRating
      reviewCount
    }
  }
`;

export const GET_BOOKINGS = gql`
  query GetBookings {
    getBookings {
      id
      ride_id
      user_id
      price
      status
      successful
      ride {
        id
        driver_id
        departure_time
        seats_available
        status
        girls_only
        to_giu
        area_id
      }
    }
  }
`;

export const GET_AREAS = gql`
  query GetAreas {
    getAreas {
      id
      name
      isActive
      meetingPoints {
        id
        name
        longitude
        latitude
        isActive
      }
    }
  }
`;

export const CREATE_RIDE_REVIEW = gql`
  mutation CreateRideReview(
    $rideId: ID!
    $riderId: ID!
    $rating: Int!
    $review: String
  ) {
    createRideReview(
      rideId: $rideId
      riderId: $riderId
      rating: $rating
      review: $review
    ) {
      id
      rating
      review
      createdAt
    }
  }
`;