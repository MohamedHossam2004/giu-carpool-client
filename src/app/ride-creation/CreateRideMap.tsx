"use client";

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Clock, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MeetingPoint } from '@/types/area';
import { color } from 'framer-motion';
// Dynamically import the map components with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

// Fix for Leaflet marker icons in Next.js
const createIcon = () => {
  if (typeof window === 'undefined') return null;
  const L = require('leaflet');
  return L.icon({
    iconUrl: '/marker-icon.png',
    iconRetinaUrl: '/marker-icon-2x.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  });
};


interface CreateRideMapProps {
  selectedAreaId?: string;
  selectedMeetingPointIds?: string[];
  toGIU?: boolean;
}

interface Route {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

const GET_AREA_QUERY = `
  query GetArea($id: ID!) {
    getArea(id: $id) {
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

const CreateRideMap: React.FC<CreateRideMapProps> = ({ 
  selectedAreaId, 
  selectedMeetingPointIds = [],
  toGIU = true 
}) => {
  const [meetingPoints, setMeetingPoints] = useState<MeetingPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>('15 min');
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [route, setRoute] = useState<Route | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [icon, setIcon] = useState<any>(null);

  // GIU coordinates  (fixed in frontend)
  const giuCoordinates: [number, number] = [30.003222, 31.698972]; // 30°00'11.6"N 31°41'56.5"E

  useEffect(() => {
    setIsClient(true);
    setIcon(createIcon());
  }, []);

  useEffect(() => {
    if (selectedAreaId) {
      fetchMeetingPoints(selectedAreaId);
    }
  }, [selectedAreaId]);

  useEffect(() => {
    // Clear route if no meeting points are selected
    if (!meetingPoints.length || !selectedMeetingPointIds.length) {
      setRoute(null);
      return;
    }

    // Find the selected points from the available meeting points
    const selectedPoints = meetingPoints.filter(point => 
      selectedMeetingPointIds.includes(point.id.toString())
    );
    
    if (!selectedPoints.length) {
      setRoute(null);
      return;
    }
    
    // Create coordinates string with all selected points in the order they were selected
    let coordinates = '';
    
    // Sort the selected points based on their order in selectedMeetingPointIds
    const orderedPoints = [...selectedPoints].sort((a, b) => {
      return selectedMeetingPointIds.indexOf(a.id.toString()) - selectedMeetingPointIds.indexOf(b.id.toString());
    });
    
    if (toGIU) {
      // To GIU: meeting points -> GIU (in the order selected)
      coordinates = orderedPoints
        .map(point => `${point.longitude},${point.latitude}`)
        .join(';') + `;${giuCoordinates[1]},${giuCoordinates[0]}`;
    } else {
      // From GIU: GIU -> meeting points (in the order selected)
      coordinates = `${giuCoordinates[1]},${giuCoordinates[0]};` + 
        orderedPoints
          .map(point => `${point.longitude},${point.latitude}`)
          .join(';');
    }
    
    // Only fetch route if we have valid coordinates
    if (coordinates.includes(';')) {
      fetchRoute(coordinates);
    } else {
      setRoute(null);
    }
  }, [meetingPoints, selectedMeetingPointIds, toGIU]);

  useEffect(() => {
    setMapReady(true);
    
    return () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
    };
  }, []);

  const fetchRoute = async (coordinates: string) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const routeData = data.routes[0];
        setRoute({
          coordinates: routeData.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]),
          distance: routeData.distance,
          duration: routeData.duration
        });
        
        // Update estimated time based on actual route duration
        const minutes = Math.ceil(routeData.duration / 60);
        setEstimatedTime(`${minutes} min`);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const fetchMeetingPoints = async (areaId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching meeting points for area:', areaId);
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_AREA_QUERY,
          variables: { id: areaId }
        }),
      });

      console.log('Meeting points response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch area data');
      }

      const result = await response.json();
      console.log('Meeting points GraphQL response:', result);
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

      if (!result.data || !result.data.getArea) {
        console.error('No area data in response');
        throw new Error('No area data received');
      }

      if (!result.data.getArea.meetingPoints) {
        console.error('No meeting points in area data');
        throw new Error('No meeting points found for this area');
      }

      console.log('Setting meeting points:', result.data.getArea.meetingPoints);
      setMeetingPoints(result.data.getArea.meetingPoints);
    } catch (error) {
      console.error('Error fetching meeting points:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching meeting points');
    } finally {
      setLoading(false);
    }
  };

  //just so map to be centerd on cairo
  const cairoCoordinates: [number, number] = [30.0444, 31.2357];

  return (
    <div className="h-full w-full">
      {isClient && mapReady && (
        <MapContainer
          center={cairoCoordinates}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* GIU Marker */}
          <Marker position={giuCoordinates} icon={icon}>
          </Marker>

          {/* Meeting Points Markers */}
          {meetingPoints.map((point) => (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={icon}
              opacity={selectedMeetingPointIds.includes(point.id.toString()) ? 1 : 0.5}
            >
            </Marker>
          ))}

          {/* Route Line */}
          {route && (
            <Polyline
              positions={route.coordinates}
              color={toGIU ? "#4285F4" : "#ef4444"}
              weight={3}
              opacity={0.9}
            />
          )}
        </MapContainer>
      )}
      
      {/* Estimated Time Display */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg flex items-center space-x-2">
        <Clock className="h-5 w-5 text-gray-600" />
        <span className="text-gray-800 font-medium">{estimatedTime}</span>
      </div>
    </div>
  );
};

export default CreateRideMap;