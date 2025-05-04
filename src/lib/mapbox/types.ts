export interface MapboxMap {
  getSource(id: string): any;
  removeLayer(id: string): void;
  removeSource(id: string): void;
  addSource(id: string, source: any): void;
  addLayer(layer: any): void;
  on(event: string, callback: (e: any) => void): void;
  off(event: string, callback: (e: any) => void): void;
  remove(): void;
  addControl(control: any, position?: string): void;
  fitBounds(bounds: MapboxLngLatBounds, options?: { 
    padding?: number | { top: number; bottom: number; left: number; right: number };
    duration?: number;
  }): void;
  flyTo(options: {
    center: [number, number];
    zoom: number;
    essential?: boolean;
    duration?: number;
  }): void;
  queryRenderedFeatures(point: { x: number; y: number }, options?: { layers?: string[] }): Array<{
    properties?: {
      name?: string;
      text?: string;
      place_name?: string;
      address?: string;
      title?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }>;
  getCanvas(): HTMLCanvasElement;
}

export interface MapboxMarker {
  setLngLat(lnglat: [number, number]): this;
  getLngLat(): { lat: number; lng: number };
  addTo(map: MapboxMap): this;
  remove(): void;
  setPopup(popup: MapboxPopup): this;
}

export interface MapboxPopup {
  setHTML(html: string): this;
  setLngLat(lnglat: [number, number]): this;
  addTo(map: MapboxMap): this;
  remove(): void;
}

export interface MapboxLngLatBounds {
  extend(point: [number, number]): this;
}

export interface MapboxNavigationControl {
  new (options?: any): MapboxNavigationControl;
}

export interface MapboxInstance {
  Map: {
    new (options: {
      container: HTMLElement;
      style: string;
      center: [number, number];
      zoom: number;
      interactive?: boolean;
    }): MapboxMap;
  };
  Marker: new (options?: any) => MapboxMarker;
  NavigationControl: new (options?: any) => MapboxNavigationControl;
  Popup: new (options?: any) => MapboxPopup;
  LngLatBounds: new () => MapboxLngLatBounds;
  accessToken: string;
}

// Add type for the Map constructor
declare global {
  interface Map<K, V> {
    clear(): void;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
    readonly size: number;
  }
  var Map: {
    new <K, V>(): Map<K, V>;
    prototype: Map<any, any>;
  };
} 