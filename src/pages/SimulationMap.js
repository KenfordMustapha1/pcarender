import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const SimulationMap = () => {
  const centerCoords = [12.8797, 121.7740]; // Center of Philippines

  return (
    <MapContainer
      center={centerCoords}
      zoom={6}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}  // MUST fill container!
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={centerCoords}>
        <Popup>
          Philippines Center
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default SimulationMap;
