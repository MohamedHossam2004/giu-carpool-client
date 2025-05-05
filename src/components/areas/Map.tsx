import { useEffect, useRef, useState, useCallback } from "react"
import { mapboxgl, MAPBOX_STYLE, DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/mapbox/init"
import { MapboxMap, MapboxMarker, MapboxPopup } from "@/lib/mapbox/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface MapProps {
  onLocationSelect: (lat: string, long: string, name?: string) => void;
  selectedAreaName?: string;
  existingPoints?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
  }>;
  selectedAreaId?: string;
  mode: 'area' | 'meeting-point';
}

export function Map({ onLocationSelect, selectedAreaName, existingPoints = [], selectedAreaId, mode }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<MapboxMap | null>(null)
  const markers = useRef<MapboxMarker[]>([])
  const popups = useRef<MapboxPopup[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Array<{
    place_name: string;
    center: [number, number];
  }>>([])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxgl) return

    // Clean up existing map if it exists
    if (map.current) {
      map.current.remove()
      map.current = null
      markers.current = []
      popups.current = []
      setMapLoaded(false)
    }

    // Create new map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLE,
      center: DEFAULT_CENTER as [number, number],
      zoom: DEFAULT_ZOOM
    })

    map.current.on('load', () => {
      setMapLoaded(true)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mode]) // Reinitialize when mode changes

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !mapboxgl || !map.current) return

    setIsSearching(true)
    setSearchResults([])
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&country=eg&types=place,locality,neighborhood,address&limit=5`
      )
      const data = await response.json()

      if (data.features && data.features.length > 0) {
        setSearchResults(data.features.map((feature: any) => ({
          place_name: feature.place_name,
          center: feature.center
        })))

        // If there's only one result, select it automatically
        if (data.features.length === 1) {
          handleSelectLocation(data.features[0])
        }
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching location:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery])

  // Handle location selection from search results
  const handleSelectLocation = useCallback((feature: any) => {
    if (!map.current || !mapboxgl) return

    const [lng, lat] = feature.center
    const placeName = feature.place_name

    // Clear existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Clear existing popups
    popups.current.forEach(popup => popup.remove())
    popups.current = []

    // Create new marker
    const marker = new mapboxgl.Marker({
      color: '#2563eb',
      scale: 0.8
    })
      .setLngLat([lng, lat])
      .addTo(map.current)

    markers.current.push(marker)

    // Create popup
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 25
    })
      .setLngLat([lng, lat])
      .setHTML(`
        <div class="p-2">
          <p class="font-medium">${placeName}</p>
          <p class="text-sm text-gray-600">Lat: ${lat.toFixed(6)}</p>
          <p class="text-sm text-gray-600">Lng: ${lng.toFixed(6)}</p>
        </div>
      `)
      .addTo(map.current)

    popups.current.push(popup)

    // Process location name based on mode
    let processedName = placeName;
    if (mode === 'area') {
      // For area mode, take only the main location name (before first comma)
      processedName = placeName.split(',')[0].trim();
    }

    // Fly to the location
    map.current.flyTo({
      center: [lng, lat],
      zoom: 14,
      essential: true,
      duration: 2000
    })

    // Update parent component
    onLocationSelect(lat.toString(), lng.toString(), processedName)
    setSearchResults([])
    setSearchQuery(processedName)
  }, [mode, onLocationSelect])

  // Handle map click
  const handleMapClick = useCallback((e: any) => {
    if (!map.current || !mapboxgl) return

    const { lng, lat } = e.lngLat

    // Clear existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Clear existing popups
    popups.current.forEach(popup => popup.remove())
    popups.current = []

    // Create new marker
    const marker = new mapboxgl.Marker({
      color: '#2563eb',
      scale: 0.8
    })
      .setLngLat([lng, lat])
      .addTo(map.current)

    markers.current.push(marker)

    // Try to get location name from various layers
    let locationName = '';
    try {
      // Query all features at the clicked point
      const features = map.current.queryRenderedFeatures(e.point);
      
      if (features.length > 0) {
        // Find the first feature with a name property
        const featureWithName = features.find(feature => {
          const props = feature.properties || {};
          return props.name || props.text || props.place_name || props.address || props.title;
        });

        if (featureWithName) {
          const props = featureWithName.properties || {};
          locationName = props.name || 
                        props.text || 
                        props.place_name || 
                        props.address || 
                        props.title || 
                        '';
        }
      }
    } catch (error) {
      console.error('Error querying map features:', error);
    }

    // Create popup
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 25
    })
      .setLngLat([lng, lat])
      .setHTML(`
        <div class="p-2">
          ${locationName ? `<p class="font-medium">${locationName}</p>` : ''}
          <p class="text-sm text-gray-600">Lat: ${lat.toFixed(6)}</p>
          <p class="text-sm text-gray-600">Lng: ${lng.toFixed(6)}</p>
        </div>
      `)
      .addTo(map.current)

    popups.current.push(popup)

    // Process location name based on mode
    let processedName = locationName;
    if (mode === 'area' && locationName) {
      // For area mode, take only the main location name (before first comma)
      processedName = locationName.split(',')[0].trim();
    }

    // Always call onLocationSelect with coordinates and processed name
    // The parent component will handle the state updates appropriately
    onLocationSelect(lat.toString(), lng.toString(), processedName || '')
  }, [onLocationSelect, mode])

  // Add click handler when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    map.current.on('click', handleMapClick)

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick)
      }
    }
  }, [mapLoaded, handleMapClick])

  // Handle existing points and area selection
  useEffect(() => {
    if (!map.current || !mapLoaded || !mapboxgl) return

    // Clear existing markers and popups
    markers.current.forEach(marker => marker.remove())
    markers.current = []
    popups.current.forEach(popup => popup.remove())
    popups.current = []

    // If we have points to show
    if (existingPoints.length > 0) {
      // Create bounds object
      const bounds = new mapboxgl.LngLatBounds()

      // Add markers for each point
      existingPoints.forEach(point => {
        const marker = new mapboxgl.Marker({
          color: point.isActive ? '#2563eb' : '#9ca3af',
          scale: 0.8
        })
          .setLngLat([point.longitude, point.latitude])
          .addTo(map.current!)

        markers.current.push(marker)

        // Add popup
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 25
        })
          .setLngLat([point.longitude, point.latitude])
          .setHTML(`
            <div class="p-2">
              <p class="font-medium">${point.name}</p>
              <p class="text-sm text-gray-600">Lat: ${point.latitude.toFixed(6)}</p>
              <p class="text-sm text-gray-600">Lng: ${point.longitude.toFixed(6)}</p>
              <p class="text-sm ${point.isActive ? 'text-green-600' : 'text-red-600'}">
                ${point.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          `)
          .addTo(map.current!)

        popups.current.push(popup)

        // Extend bounds to include this point
        bounds.extend([point.longitude, point.latitude])
      })

      // Fit map to bounds with padding
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000
      })
    } else if (selectedAreaId) {
      // If no points but area is selected, center on Cairo
      map.current.flyTo({
        center: [31.2357, 30.0444] as [number, number],
        zoom: 11,
        essential: true,
        duration: 1000
      })
    }
  }, [existingPoints, selectedAreaId, mapLoaded])

  return (
    <Card className="relative h-[600px] overflow-hidden">
      {selectedAreaName && (
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="secondary" className="px-3 py-1.5 text-sm">
            {selectedAreaName}
          </Badge>
        </div>
      )}
      <div className="absolute top-4 right-4 z-10 w-64">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pr-10 border-black text-black border-2"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-20">
            {searchResults.map((result, index) => (
              <button
                key={index}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => handleSelectLocation({
                  center: result.center,
                  place_name: result.place_name
                })}
              >
                <p className="text-sm font-medium">{result.place_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>
      <div ref={mapContainer} className="w-full h-full" />
    </Card>
  )
} 