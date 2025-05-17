"use client";

import React, { useEffect, useState, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MeetingPoint } from '@/types/area';

// Add CSS for custom markers
const customMarkerStyle = `
  .custom-marker {
    background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2238%22%20height%3D%2238%22%20viewBox%3D%220%200%2038%2038%22%3E%3Cpath%20fill%3D%22%23EA4335%22%20stroke-width%3D%221.5%22%20d%3D%22M19%200C10.178%200%203%207.178%203%2016.001%203%2024.823%2019%2038%2019%2038s16-13.177%2016-21.999C35%207.178%2027.822%200%2019%200zm0%2024a8%208%200%20110-16%208%208%200%20010%2016z%22%2F%3E%3C%2Fsvg%3E');
    background-size: cover;
    width: 30px;
    height: 30px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    cursor: pointer;
  }
  .custom-marker.giu {
    background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2238%22%20height%3D%2238%22%20viewBox%3D%220%200%2038%2038%22%3E%3Cpath%20fill%3D%22%234285F4%22%20stroke-width%3D%221.5%22%20d%3D%22M19%200C10.178%200%203%207.178%203%2016.001%203%2024.823%2019%2038%2019%2038s16-13.177%2016-21.999C35%207.178%2027.822%200%2019%200zm0%2024a8%208%200%20110-16%208%208%200%20010%2016z%22%2F%3E%3C%2Fsvg%3E');
  }
`;

// Import mapboxgl dynamically to avoid SSR issues
let mapboxgl: any = null;
if (typeof window !== 'undefined') {
  mapboxgl = require('mapbox-gl');
}

interface RideMapProps {
  ride: {
    toGIU: boolean;
    meetingPoints: {
      id: string;
      meetingPoint: {
        id: string;
        name: string;
        latitude?: number;
        longitude?: number;
        isActive: boolean;
      };
    }[];
  };
}

interface Route {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

// Mapbox access token
if (typeof window !== 'undefined' && mapboxgl) {
  mapboxgl.accessToken = 'pk.eyJ1IjoibW9oYW1tYWRtb2hhcnJhbSIsImEiOiJjbWEzMDlhbGMxaDUxMmpzOGMxdnJwaHN3In0.bEf7Lpkfdvc_BFlzd4rlaA';
}

const RideMap: React.FC<RideMapProps> = ({ ride }) => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [route, setRoute] = useState<Route | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLayerId = 'route';
  
  // GIU coordinates (fixed in frontend)
  const giuCoordinates: [number, number] = [31.698972, 30.003222]; // [lng, lat] format for Mapbox

  // Inject styles into the head
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.innerText = customMarkerStyle;
      document.head.appendChild(styleSheet);
    }
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
      style: 'mapbox://styles/mapbox/streets-v12',
      center: giuCoordinates,
      zoom: 10,
      attributionControl: false,
      fadeDuration: 300,
      interactive: true
    });
    
    // Add navigation controls (zoom in/out)
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add GIU marker when map loads
    map.current.on('load', () => {
      if (!map.current) return;
      
      // Create custom element for GIU marker
      const el = document.createElement('div');
      el.className = 'custom-marker giu';

      // Add GIU marker
      const giuMarker = new mapboxgl.Marker(el)
        .setLngLat(giuCoordinates)
        .addTo(map.current);
      
      markersRef.current.push(giuMarker);

      // Add meeting point markers and draw route
      addMeetingPointMarkers();
      drawRoute();
    });
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Clear existing markers except GIU marker
  const clearMeetingPointMarkers = () => {
    // Keep the first marker (GIU) and remove the rest
    if (markersRef.current.length > 1) {
      for (let i = 1; i < markersRef.current.length; i++) {
        markersRef.current[i].remove();
      }
      markersRef.current = [markersRef.current[0]];
    }
  };

  // Add markers for meeting points
  const addMeetingPointMarkers = () => {
    if (!map.current || !mapboxgl) return;

    clearMeetingPointMarkers();

    // Get meeting points with coordinates
    const meetingPointsWithCoords = ride.meetingPoints
      .filter(mp => mp.meetingPoint.latitude && mp.meetingPoint.longitude)
      .map(mp => ({
        id: mp.id,
        name: mp.meetingPoint.name,
        latitude: mp.meetingPoint.latitude,
        longitude: mp.meetingPoint.longitude
      }));

    // Add markers for each meeting point
    meetingPointsWithCoords.forEach((point) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([point.longitude!, point.latitude!])
        .addTo(map.current!);
      
      // Add popup with meeting point name
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h3>${point.name}</h3>`);
      
      marker.setPopup(popup);
      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (meetingPointsWithCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      // Add GIU coordinates to bounds
      bounds.extend(giuCoordinates);
      
      // Add all meeting point coordinates to bounds
      meetingPointsWithCoords.forEach(point => {
        bounds.extend([point.longitude!, point.latitude!]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      });
    }
  };

  // Draw route on the map
  const drawRoute = async () => {
    if (!map.current || !mapboxgl) return;

    // Get meeting points with coordinates
    const meetingPointsWithCoords = ride.meetingPoints
      .filter(mp => mp.meetingPoint.latitude && mp.meetingPoint.longitude)
      .map(mp => ({
        id: mp.id,
        name: mp.meetingPoint.name,
        latitude: mp.meetingPoint.latitude,
        longitude: mp.meetingPoint.longitude
      }));

    if (meetingPointsWithCoords.length === 0) return;

    try {
      // Create coordinates string with all meeting points
      let coordinates = '';
      
      if (ride.toGIU) {
        // To GIU: meeting points -> GIU
        coordinates = meetingPointsWithCoords
          .map(point => `${point.longitude},${point.latitude}`)
          .join(';');
        coordinates += `;${giuCoordinates[0]},${giuCoordinates[1]}`;
      } else {
        // From GIU: GIU -> meeting points
        coordinates = `${giuCoordinates[0]},${giuCoordinates[1]};`;
        coordinates += meetingPointsWithCoords
          .map(point => `${point.longitude},${point.latitude}`)
          .join(';');
      }

      // Fetch route from Mapbox Directions API
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const routeData = data.routes[0];
        
        // Convert coordinates to the format expected by Mapbox
        const routeCoordinates = routeData.geometry.coordinates;
        
        // Store route data
        setRoute({
          coordinates: routeCoordinates,
          distance: routeData.distance,
          duration: routeData.duration
        });
        
        // Add route to map
        if (map.current) {
          // Remove existing route layer and source if they exist
          if (map.current.getSource(routeLayerId)) {
            map.current.removeLayer(routeLayerId);
            map.current.removeSource(routeLayerId);
          }
          
          // Add new route source
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
          
          // Add new route layer
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
              'line-width': 5,
              'line-opacity': 0.8
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 h-[400px]">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">🗺️ Ride Route</h2>
      <div ref={mapContainer} className="h-[320px] w-full rounded-lg overflow-hidden" />
    </div>
  );
};

export default RideMap;