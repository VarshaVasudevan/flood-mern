'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { FaWater } from 'react-icons/fa';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

import L from 'leaflet';

// Fix for Leaflet in Next.js
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

export default function Map() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([39.8283, -98.5795]);

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/locations');
      // Validate locations data
      const validLocations = response.data.filter(loc => 
        loc.coordinates && 
        typeof loc.coordinates.lat === 'number' && 
        typeof loc.coordinates.lng === 'number'
      );
      setLocations(validLocations);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load map data. Please make sure the server is running.');
      setLoading(false);
    }
  };

  const getMarkerColor = (riskLevel) => {
    switch(riskLevel) {
      case 'Critical': return '#9e5a3a';
      case 'High': return '#d4a373';
      case 'Moderate': return '#6b8c5c';
      default: return '#4a6b3f';
    }
  };

  const getRadius = (waterLevel) => {
    return Math.max(8, Math.min(28, waterLevel * 2.5));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container>
          <div className="text-center mt-5">
            <div className="loader"></div>
            <p className="mt-3" style={{ color: '#5c3b2a' }}>Loading map data...</p>
          </div>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container className="mt-5">
          <Alert variant="danger">
            <Alert.Heading>Error Loading Map</Alert.Heading>
            <p>{error}</p>
            <hr />
            <p className="mb-0">Please check if the backend server is running on port 5000.</p>
          </Alert>
        </Container>
      </>
    );
  }

  if (locations.length === 0) {
    return (
      <>
        <Navbar />
        <Container className="mt-5">
          <Alert variant="info">
            <Alert.Heading>No Location Data</Alert.Heading>
            <p>No location data available. Please check the database connection.</p>
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container fluid className="px-4">
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">🗺️ Flood Risk Map</h5>
                <p className="text-muted mb-0">Interactive map showing flood risk levels at all {locations.length} locations</p>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '600px', width: '100%' }}>
                  <MapContainer
                    center={mapCenter}
                    zoom={4}
                    style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {locations.map(location => {
                      // Safety check to ensure coordinates exist
                      if (!location.coordinates || typeof location.coordinates.lat !== 'number' || typeof location.coordinates.lng !== 'number') {
                        console.warn('Invalid coordinates for location:', location.name);
                        return null;
                      }
                      
                      return (
                        <CircleMarker
                          key={location._id}
                          center={[location.coordinates.lat, location.coordinates.lng]}
                          radius={getRadius(location.waterLevel)}
                          fillColor={getMarkerColor(location.riskLevel)}
                          color={getMarkerColor(location.riskLevel)}
                          weight={2}
                          opacity={0.8}
                          fillOpacity={0.6}
                        >
                          <Popup>
                            <div style={{ minWidth: '200px' }}>
                              <strong style={{ color: '#5c3b2a' }}>{location.name}</strong><br />
                              <small>Region: {location.region}</small><br />
                              <hr className="my-1" />
                              <strong>Water Level:</strong> {location.waterLevel} m<br />
                              <strong>Rainfall:</strong> {location.rainfall} mm<br />
                              <strong>Temperature:</strong> {location.temperature}°C<br />
                              <strong>Humidity:</strong> {location.humidity}%<br />
                              <strong>Risk Level:</strong>{' '}
                              <Badge bg={location.riskLevel === 'Critical' ? 'danger' : location.riskLevel === 'High' ? 'warning' : location.riskLevel === 'Moderate' ? 'info' : 'success'}>
                                {location.riskLevel}
                              </Badge><br />
                              <strong>Status:</strong>{' '}
                              <Badge bg={location.status === 'Evacuation' ? 'danger' : location.status === 'Warning' ? 'warning' : location.status === 'Alert' ? 'info' : 'success'}>
                                {location.status}
                              </Badge><br />
                              <small className="text-muted mt-2 d-block">{location.alertMessage}</small>
                            </div>
                          </Popup>
                        </CircleMarker>
                      );
                    })}
                  </MapContainer>
                </div>
                
                <div className="mt-3">
                  <h6 style={{ color: '#5c3b2a' }}>Legend:</h6>
                  <div className="d-flex gap-3 flex-wrap">
                    <div><Badge bg="success">● Low Risk</Badge> <small>Water Level {'<'} 3m</small></div>
                    <div><Badge bg="info">● Moderate Risk</Badge> <small>Water Level 3-5m</small></div>
                    <div><Badge bg="warning">● High Risk</Badge> <small>Water Level 5-7m</small></div>
                    <div><Badge bg="danger">● Critical Risk</Badge> <small>Water Level {'>'} 7m</small></div>
                  </div>
                  <small className="text-muted mt-2 d-block">
                    <FaWater className="me-1" /> Circle size represents water level (larger = higher water level)
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      <footer className="text-center py-4 mt-5">
        <Container>
          <p className="mb-0">© 2024 FloodWatch Pro | Real-time Flood Monitoring System</p>
          <small>Monitoring {locations.length} locations | Data updates every 5 minutes</small>
        </Container>
      </footer>
    </>
  );
}