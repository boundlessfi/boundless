'use client';

import React, { useEffect, useRef } from 'react';

interface MapWidgetProps {
  lat: number;
  lng: number;
  address: string;
  zoom?: number;
  height?: string;
  width?: string;
}

const MapWidget: React.FC<MapWidgetProps> = ({
  lat,
  lng,
  address,
  zoom = 15,
  height = '100%',
  width = '100%',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load JS
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(window as any).L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          initializeMap();
        };
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!mapRef.current || !(window as any).L) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L as any;

      // Clear existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Create new map
      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Add marker
      const marker = L.marker([lat, lng]).addTo(map);

      // Add popup with address
      marker
        .bindPopup(
          `
                <div style="max-width: 200px;">
                    <strong>Venue Location</strong><br>
                    ${address}
                </div>
            `
        )
        .openPopup();

      mapInstanceRef.current = map;
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, address, zoom]);

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width,
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
      }}
    >
      <div className='text-center'>
        <div className='border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2'></div>
        <p className='text-sm'>Loading map...</p>
      </div>
    </div>
  );
};

export default MapWidget;
