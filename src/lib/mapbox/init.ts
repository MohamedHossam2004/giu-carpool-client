import { MapboxInstance } from './types';

// Constants
export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibW9oYW1tYWRtb2hhcnJhbSIsImEiOiJjbWEzMDlhbGMxaDUxMmpzOGMxdnJwaHN3In0.bEf7Lpkfdvc_BFlzd4rlaA';
export const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12';
export const DEFAULT_CENTER = [31.698972, 30.003222]; // GIU coordinates
export const DEFAULT_ZOOM = 12;

let mapboxgl: MapboxInstance | null = null;

if (typeof window !== 'undefined') {
  mapboxgl = require('mapbox-gl');
  
  // Import CSS in a way that works with Next.js
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  // Set access token
  if (mapboxgl) {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  }
}

export { mapboxgl }; 