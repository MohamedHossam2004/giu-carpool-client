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

export const GET_BOOKING_BY_ID = gql`
  query GetBookingById($id: ID!) {
    booking(id: $id) {
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
        # Add other ride fields you might need, e.g., area name
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

const GET_MY_REVIEWS = gql`
  query GetMyReviews($riderId: ID!) {
    getRiderReviews(riderId: $riderId) {
      id
      ride { # Assuming ride object with id is nested
        id
      }
    }
  }
`;

export const CREATE_AREA_MUTATION = gql`
  mutation CreateAreaWithMeetingPoints($input: CreateAreaInput!) {
    createAreaWithMeetingPoints(input: $input) {
      id
      name
      isActive
      meetingPoints {
        id
        name
        latitude
        longitude
        isActive
      }
    }
  }
`;

export const CREATE_MEETING_POINT_MUTATION = gql`
  mutation CreateMeetingPoint($areaId: ID!, $input: MeetingPointInput!) {
    createMeetingPoint(areaId: $areaId, input: $input) {
      id
      name
      latitude
      longitude
      isActive
      area {
        id
        name
        isActive
      }
    }
  }
`;

export const DELETE_AREA_MUTATION = gql`
  mutation DeleteArea($id: ID!) {
    deleteArea(id: $id)
  }
`;

export const DELETE_MEETING_POINT_MUTATION = gql`
  mutation DeleteMeetingPoint($id: ID!) {
    deleteMeetingPoint(id: $id)
  }
`;

export const GET_RIDE_REVIEWS = gql`
  query GetRideReviews($rideId: ID!) {
    getRideReviews(rideId: $rideId) {
      id
      ride {
        id
      }
      driverId
      riderId
      rating
      review
      createdAt
    }
  }
`;

export const GET_DRIVER_RIDE_BY_STATUS = gql`
  query GetDriverRideByStatus($status: RideStatus!) {
    getDriverRideByStatus(status: $status) {
      id
      status
      toGIU
      girlsOnly
      departureTime
      area {
        id
        name
      }
      meetingPoints {
        id
        price
        orderIndex
        meetingPoint {
          id
          name
        }
      }
      passengers {
        id
        passengerId
        passengerName
      }
      reviews {
        id
        rating
        review
      }
    }
  }
`;

export const GET_RIDE_BY_ID = gql`
  query GetRide($id: ID!) {
    ride(id: $id) {
      id
      status
      driverId
      girlsOnly
      toGIU
      departureTime
      createdAt
      updatedAt
      seatsAvailable
      area {
        name
      }
      meetingPoints {
        id
        price
        orderIndex
        meetingPoint {
          id
          name
          latitude
          longitude
          isActive
        }
      }
      passengers {
        id
        passengerId
        passengerName
        createdAt
      }
      reviews {
        id
        rating
        review
        createdAt
      }
    }
  }
`;

export const UPDATE_RIDE_STATUS = gql`
  mutation UpdateRideStatus($rideId: Int!, $status: RideStatus!) {
    updateRideStatus(rideId: $rideId, status: $status) {
      id
      status
      updatedAt
    }
  }
`;