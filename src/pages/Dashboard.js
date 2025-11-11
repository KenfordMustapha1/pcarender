import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  MapContainer,
  TileLayer,
  // GeoJSON, // Removed unused import
  Marker,
  Popup,
  useMap,
  Circle
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Dashboard1.css';
import L from 'leaflet';
import 'leaflet.heat';

const calculateRadius = (landArea) => {
  if (!landArea || landArea <= 0) return 100;
  const areaInSquareMeters = landArea * 10000;
  const radius = Math.sqrt(areaInSquareMeters / Math.PI);
  return Math.min(Math.max(radius, 50), 2000);
};

const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    const heatLayer = L.heatLayer(
      points.map(p => [p.lat, p.lng, 0.5]),
      { radius: 25, blur: 15, maxZoom: 17, gradient: { 0.4: 'yellow', 0.65: 'orange', 1: 'red' } }
    );
    heatLayer.addTo(map);

    return () => {
      heatLayer.remove();
    };
  }, [points, map]);

  return null;
};

const Dashboard = () => {
  const [farmerCount, setFarmerCount] = useState(0);
  const [manufacturerCount, setManufacturerCount] = useState(0);
  // Remove unused setFarmers state - keeping the destructuring but marking as unused
  const [, setFarmers] = useState([]); // eslint-disable-line no-unused-vars
  const [manufacturers, setManufacturers] = useState([]);
  const [approvedRegistrations, setApprovedRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedRegistrations = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/registrations/summary');
        const approvedRegs = res.data.filter(reg => 
          reg.status === 'accepted' && 
          reg.coordinates && 
          reg.coordinates.coordinates && 
          reg.coordinates.coordinates.length === 2
        ).map(reg => ({
          id: reg._id,
          type: 'approved_registration',
          name: reg.registeredbusinessname,
          lat: reg.coordinates.coordinates[1],
          lng: reg.coordinates.coordinates[0],
          province: reg.province,
          municipality: reg.municipality,
          barangay: reg.barangay,
          landArea: reg.landArea
        }));
        
        setApprovedRegistrations(approvedRegs);
        setFarmerCount(approvedRegs.length);
      } catch (error) {
        console.error('Error fetching approved registrations:', error);
        setFarmerCount(0);
      }
    };

    fetchApprovedRegistrations();
  }, []);

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/manufacturers');
        setManufacturers(res.data);
        setManufacturerCount(res.data.length);
      } catch (error) {
        console.error('Error fetching manufacturers:', error);
        setManufacturers([]);
        setManufacturerCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchManufacturers();
  }, []);

  const createCustomIcon = (color) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:12px; height:12px; background:${color}; border-radius:50%; border: 2px solid white;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="header">
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            <span>Admin</span>
          </div>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Admin</span>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card primary">
          <div className="stat-icon">
            <div className="modern-icon farmer-icon"></div>
          </div>
          <div className="stat-content">
            <h3>Registered Farmers</h3>
            <p className="stat-value">{farmerCount}</p>
          </div>
        </div>
        <div className="stat-card secondary">
          <div className="stat-icon">
            <div className="modern-icon manufacturer-icon"></div>
          </div>
          <div className="stat-content">
            <h3>Manufacturers</h3>
            <p className="stat-value">{manufacturerCount}</p>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">
            <div className="modern-icon approved-icon"></div>
          </div>
          <div className="stat-content">
            <h3>Approved Apps</h3>
            <p className="stat-value">{approvedRegistrations.length}</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">
            <div className="modern-icon land-icon"></div>
          </div>
          <div className="stat-content">
            <h3>Total Land Area</h3>
            <p className="stat-value">{approvedRegistrations.reduce((sum, reg) => sum + (reg.landArea || 0), 0).toFixed(2)} ha</p>
          </div>
        </div>
      </div>

      <div className="content-row">
        <div className="map-section">
          <h2>Geographic Distribution</h2>
          <div className="map-container">
            <MapContainer center={[14.35, 121.4]} zoom={10} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />

              {approvedRegistrations.length > 0 && <HeatmapLayer points={approvedRegistrations} />}

              {approvedRegistrations.map(reg => {
                const radius = calculateRadius(reg.landArea);
                return (
                  <Circle
                    key={`reg-${reg.id}`}
                    center={[reg.lat, reg.lng]}
                    radius={radius}
                    color="#00BF63"
                    fillColor="#00BF63"
                    fillOpacity={0.2}
                    weight={2}
                  >
                    <Popup>
                      <div>
                        <strong>{reg.name}</strong><br/>
                        {reg.province}, {reg.municipality}, {reg.barangay}<br/>
                        Land Area: {reg.landArea ? `${reg.landArea} ha` : 'N/A'}<br/>
                        Type: Farmer
                      </div>
                    </Popup>
                  </Circle>
                );
              })}

              {approvedRegistrations.map(reg => (
                <Marker
                  key={`reg-marker-${reg.id}`}  
                  position={[reg.lat, reg.lng]}
                  icon={createCustomIcon('#00BF63')}
                  opacity={0}
                >
                  <Popup>
                    <div>
                      <strong>{reg.name}</strong><br/>
                      {reg.province}, {reg.municipality}, {reg.barangay}<br/>
                      Land Area: {reg.landArea ? `${reg.landArea} ha` : 'N/A'}<br/>
                      Type: Farmer
                    </div>
                  </Popup>
                </Marker>
              ))}

              {manufacturers.map(m => (
                <Marker
                  key={`manufacturer-${m.id}`}
                  position={[m.lat, m.lng]}
                  icon={createCustomIcon('#FF9F43')}
                >
                  <Popup>
                    <div>
                      <strong>{m.name}</strong><br/>
                      Type: Manufacturer
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="info-section">
          <div className="legend">
            <h3>Map Legend</h3>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#00BF63' }}></div>
              <span>Farmers (Approved)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#FF9F43' }}></div>
              <span>Manufacturers</span>
            </div>
            <div className="legend-density">
              <h4>Application Density</h4>
              <div className="density-scale">
                <div style={{ backgroundColor: '#E3F2FD' }}></div>
                <div style={{ backgroundColor: '#BBDEFB' }}></div>
                <div style={{ backgroundColor: '#64B5F6' }}></div>
                <div style={{ backgroundColor: '#2196F3' }}></div>
              </div>
              <div className="density-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>

          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <ul>
              {/* <li>New farmer registration: {farmers[0]?.name || 'N/A'}</li> */}
              <li>New manufacturer: {manufacturers[0]?.name || 'N/A'}</li>
              <li>Recent approval: {approvedRegistrations[0]?.name || 'N/A'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;