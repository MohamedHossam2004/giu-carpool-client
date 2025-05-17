"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { MeetingPoint } from '@/types/area';
import 'mapbox-gl/dist/mapbox-gl.css';

// Add CSS for custom markers
const customMarkerStyle = `
  .map-pin-marker {
    background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2238%22%20height%3D%2238%22%20viewBox%3D%220%200%2038%2038%22%3E%3Cpath%20fill%3D%22%23EA4335%22%20stroke-width%3D%221.5%22%20d%3D%22M19%200C10.178%200%203%207.178%203%2016.001%203%2024.823%2019%2038%2019%2038s16-13.177%2016-21.999C35%207.178%2027.822%200%2019%200zm0%2024a8%208%200%20110-16%208%208%200%20010%2016z%22%2F%3E%3C%2Fsvg%3E');
    background-size: cover;
    width: 30px;
    height: 30px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    /* border: 1px solid #fff; */ /* Removed white border */
    cursor: pointer;
    /* box-shadow: 0 2px 4px rgba(0,0,0,0.3); */
  }
  .map-pin-marker.giu {
    background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2238%22%20height%3D%2238%22%20viewBox%3D%220%200%2038%2038%22%3E%3Cpath%20fill%3D%22%234285F4%22%20stroke-width%3D%221.5%22%20d%3D%22M19%200C10.178%200%203%207.178%203%2016.001%203%2024.823%2019%2038%2019%2038s16-13.177%2016-21.999C35%207.178%2027.822%200%2019%200zm0%2024a8%208%200%20110-16%208%208%200%20010%2016z%22%2F%3E%3C%2Fsvg%3E');
  }
  /* Removed .unselected style as it's no longer needed */
`;



// Import mapboxgl dynamically to avoid SSR issues
let mapboxgl: any = null;
if (typeof window !== 'undefined') {
  mapboxgl = require('mapbox-gl');
}

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

// Mapbox access token - in a real app, this should be in an environment variable
if (typeof window !== 'undefined' && mapboxgl) {
  mapboxgl.accessToken = 'pk.eyJ1IjoibW9oYW1tYWRtb2hhcnJhbSIsImEiOiJjbWEzMDlhbGMxaDUxMmpzOGMxdnJwaHN3In0.bEf7Lpkfdvc_BFlzd4rlaA';
}

const CreateRideMap: React.FC<CreateRideMapProps> = ({ 
  selectedAreaId, 
  selectedMeetingPointIds = [],
  toGIU = true 
}) => {
  const [meetingPoints, setMeetingPoints] = useState<MeetingPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>('15 min');
  const [isClient, setIsClient] = useState<boolean>(false);
  const [route, setRoute] = useState<Route | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const routeLayerId = 'route';
  
  // GIU coordinates (fixed in frontend)
  const giuCoordinates: [number, number] = [31.698972, 30.003222]; // [lng, lat] format for Mapbox

  // Inject styles into the head and clean up on unmount
  useEffect(() => {
    let styleSheetElement: HTMLStyleElement | null = null;
    if (typeof window !== 'undefined') {
      styleSheetElement = document.createElement("style");
      styleSheetElement.type = "text/css";
      styleSheetElement.innerText = customMarkerStyle; // customMarkerStyle is defined in the outer scope
      document.head.appendChild(styleSheetElement);
    }
    return () => {
      if (styleSheetElement && document.head.contains(styleSheetElement)) {
        document.head.removeChild(styleSheetElement);
      }
    };
  }, []);
  

  // Initialize map when component mounts
  useEffect(() => {
    setIsClient(true);
    
    // Only run on client-side
    if (typeof window === 'undefined' || !mapboxgl) return;
    
    if (!mapContainer.current) return;
    
    // Initialize map only once
    if (map.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Google Maps-like style
      center: giuCoordinates,
      zoom: 10,
      attributionControl: false,
      // Add smoother animation options
      fadeDuration: 300, // Default is 300, keep it
      // Note: Mapbox doesn't have a single 'duration' for all animations like fitBounds.
      // Panning/zooming inertia and easing are controlled by other properties or methods.
      // The default interactions are generally smooth. We've already improved fitBounds.
      // Let's ensure interactive is true (default) for standard pan/zoom.
      interactive: true
    });
    
    // Add navigation controls (zoom in/out)
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add GIU marker when map loads
    map.current.on('load', () => {
      if (!map.current) return;
      
      // Create custom element for GIU marker
      const el = document.createElement('div');
      el.className = 'map-pin-marker giu';

      // Add GIU marker
      const giuMarker = new mapboxgl.Marker(el)
        .setLngLat(giuCoordinates)
        .addTo(map.current);
      
      markersRef.current.push(giuMarker);
    });
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Fetch meeting points when selectedAreaId changes
  useEffect(() => {
    if (selectedAreaId) {
      fetchMeetingPoints(selectedAreaId);
    }
  }, [selectedAreaId]);

  // Update route when meeting points or selectedMeetingPointIds change
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined' || !mapboxgl) return;
    
    // Clear existing markers except GIU marker
    clearMeetingPointMarkers();
    
    // Clear existing route
    if (map.current && map.current.getSource(routeLayerId)) {
      map.current.removeLayer(routeLayerId);
      map.current.removeSource(routeLayerId);
    }
    
    // Exit if no meeting points or no selected meeting points
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
    
    // Add markers for all meeting points
    addMeetingPointMarkers();
    
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
        .join(';') + `;${giuCoordinates[0]},${giuCoordinates[1]}`;
    } else {
      // From GIU: GIU -> meeting points (in the order selected)
      coordinates = `${giuCoordinates[0]},${giuCoordinates[1]};` + 
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

  // Add meeting point markers to the map
  // Add markers for selected meeting points
  const addMeetingPointMarkers = () => {
    if (!map.current || !mapboxgl) return;
    
    meetingPoints.forEach(point => {
      const isSelected = selectedMeetingPointIds.includes(point.id.toString());
      if (!isSelected) return; // Skip unselected points
      
      // Create custom element for meeting point marker
      const el = document.createElement('div');
      el.className = 'map-pin-marker';
  
      const marker = new mapboxgl.Marker(el)
        .setLngLat([point.longitude, point.latitude])
        .addTo(map.current!);
      
      markersRef.current.push(marker);
    });
  };

  // Clear all meeting point markers
  const clearMeetingPointMarkers = () => {
    // Remove all markers except the first one (GIU marker)
    if (markersRef.current.length > 1) {
      for (let i = 1; i < markersRef.current.length; i++) {
        markersRef.current[i].remove();
      }
      markersRef.current = [markersRef.current[0]]; // Keep only GIU marker
    }
  };

  // Fetch route from OSRM API
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
        const routeCoordinates = routeData.geometry.coordinates;
        
        setRoute({
          coordinates: routeData.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]),
          distance: routeData.distance,
          duration: routeData.duration
        });
        
        // Update estimated time based on actual route duration
        const minutes = Math.ceil(routeData.duration / 60);
        setEstimatedTime(`${minutes} min`);
        
        // Add route to map
        if (map.current) {
          // Remove existing route if it exists
          if (map.current.getSource(routeLayerId)) {
            map.current.removeLayer(routeLayerId);
            map.current.removeSource(routeLayerId);
          }
          
          // Add new route
          map.current.addSource(routeLayerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routeCoordinates
              }
            }
          });
          
          map.current.addLayer({
            id: routeLayerId,
            type: 'line',
            source: routeLayerId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#4285F4', // Blue color similar to Google Maps
              'line-width': 6 // Slightly thicker line
            }
          });
          
          // Fit map to show all points and route
          fitMapToRoute(routeCoordinates);
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };
  
  // Note: Removed the simple dash-array animation as it doesn't resemble Google Maps.
  // A more complex animation (e.g., drawing the line progressively) would require more effort.
  // const animateRoute = () => { ... };
  
  // Fit map to show all points in the route
  const fitMapToRoute = (routeCoordinates: number[][]) => {
    if (!map.current || !routeCoordinates.length || !mapboxgl) return;
    
    const bounds = new mapboxgl.LngLatBounds();
    
    // Add route coordinates to bounds
    routeCoordinates.forEach(coord => {
      bounds.extend([coord[0], coord[1]]);
    });
    
    // Add GIU coordinates to bounds
    bounds.extend(giuCoordinates);
    
    // Add selected meeting points to bounds
    meetingPoints
      .filter(point => selectedMeetingPointIds.includes(point.id.toString()))
      .forEach(point => {
        bounds.extend([point.longitude, point.latitude]);
      });
    
    map.current.fitBounds(bounds, {
      padding: {
        top: 60,
        bottom: 80, // More padding at the bottom to avoid overlap with time estimate
        left: 60,
        right: 60
      },
      maxZoom: 15,
      duration: 1500, // Slightly longer duration for smoother animation
      essential: true // Ensures the animation completes even if interrupted
    });
  };

  // Fetch meeting points for the selected area
  const fetchMeetingPoints = async (areaId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching meeting points for area:', areaId);
      const response = await fetch('https://3.239.254.154/graphql', {
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

  return (
    <div className="h-full w-full relative">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Estimated Time Display */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-300 ease-in-out">
        <Clock className="h-5 w-5 text-gray-600" />
        <span className="text-gray-800 font-medium">{estimatedTime}</span>
      </div>
    </div>
  );
};

export default CreateRideMap;