import React, { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import './App.css';

interface Camera {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const MAP_CENTER = { lat: 3.1390, lng: 101.6869 }; // Kuala Lumpur approx

const App: React.FC = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);

  // Load Google Maps JS API (replace YOUR_API_KEY with a placeholder – user will add their own)
  useEffect(() => {
    const loader = new Loader({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
      version: 'weekly',
      libraries: ['places']
    });
    loader.load().then(() => {
      const mapInstance = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        center: MAP_CENTER,
        zoom: 8,
        mapTypeId: 'roadmap',
        fullscreenControl: false,
        streetViewControl: false
      });
      setMap(mapInstance);
    });
  }, []);

  // Fetch camera GeoJSON and add markers
  useEffect(() => {
    fetch('/cameras.geojson')
      .then(res => res.json())
      .then((data) => {
        const features = data.features || [];
        const cams: Camera[] = features.map((f: any) => ({
          id: f.id,
          name: f.properties?.name || 'Camera',
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0]
        }));
        setCameras(cams);
      });
  }, []);

  // Add markers when map and cameras are ready
  useEffect(() => {
    if (!map) return;
    cameras.forEach((cam) => {
      new google.maps.Marker({
        position: { lat: cam.lat, lng: cam.lng },
        map,
        title: cam.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: '#ff6b6b',
          fillOpacity: 0.9,
          strokeWeight: 1,
          strokeColor: '#fff'
        }
      });
    });
  }, [map, cameras]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Highway Camera Viewer</h1>
        <p>Zoom in to see camera locations along Malaysia's highways.</p>
      </header>
      <div id="map" className="map-canvas" />
    </div>
  );
};

export default App;
