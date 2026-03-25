'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Badge, ListGroup, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { FaExclamationTriangle, FaBell, FaCheckCircle, FaClock, FaWater } from 'react-icons/fa';

export default function Alerts() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [highAlerts, setHighAlerts] = useState([]);
  const [moderateAlerts, setModerateAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/locations');
      setLocations(response.data);
      
      setCriticalAlerts(response.data.filter(l => l.riskLevel === 'Critical'));
      setHighAlerts(response.data.filter(l => l.riskLevel === 'High'));
      setModerateAlerts(response.data.filter(l => l.riskLevel === 'Moderate'));
      
      setError(null);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Failed to fetch alerts. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (riskLevel) => {
    switch(riskLevel) {
      case 'Critical': return <FaExclamationTriangle className="text-danger" size={24} />;
      case 'High': return <FaExclamationTriangle className="text-warning" size={24} />;
      case 'Moderate': return <FaBell className="text-info" size={24} />;
      default: return <FaCheckCircle className="text-success" size={24} />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container>
          <div className="text-center mt-5">
            <div className="loader"></div>
            <p className="mt-3" style={{ color: '#5c3b2a' }}>Loading alerts...</p>
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
            <Alert.Heading>Error!</Alert.Heading>
            <p>{error}</p>
            <hr />
            <p className="mb-0">Please make sure the backend server is running on port 5000.</p>
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container fluid className="px-4">
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header style={{ background: '#f5efe5' }}>
                <h5 className="mb-0" style={{ color: '#5c3b2a' }}>🔔 Flood Alerts & Notifications</h5>
                <p className="text-muted mb-0">Real-time alerts for all monitored locations</p>
              </Card.Header>
              <Card.Body>
                {criticalAlerts.length > 0 && (
                  <Alert variant="danger" className="mb-4 critical-alert">
                    <Alert.Heading>
                      <FaExclamationTriangle className="me-2" /> CRITICAL ALERTS - Immediate Action Required!
                    </Alert.Heading>
                    <p>{criticalAlerts.length} location(s) are at critical risk. Evacuation may be necessary.</p>
                    <hr />
                    <p className="mb-0">Affected areas: {criticalAlerts.map(l => l.name).join(', ')}</p>
                  </Alert>
                )}
                
                <Row>
                  <Col md={4} className="mb-3">
                    <Card className="h-100" style={{ borderTop: '4px solid #9e5a3a' }}>
                      <Card.Header style={{ background: '#fff5f0', color: '#5c3b2a' }}>
                        <FaExclamationTriangle className="me-2" style={{ color: '#9e5a3a' }} /> 
                        Critical Alerts ({criticalAlerts.length})
                      </Card.Header>
                      <ListGroup variant="flush">
                        {criticalAlerts.length > 0 ? (
                          criticalAlerts.map(alert => (
                            <ListGroup.Item key={alert._id} className="d-flex align-items-start">
                              {getAlertIcon(alert.riskLevel)}
                              <div className="ms-3 flex-grow-1">
                                <strong style={{ color: '#5c3b2a' }}>{alert.name}</strong>
                                <p className="mb-0 small text-muted">{alert.region}</p>
                                <p className="mb-0 mt-1 text-danger small fw-bold">{alert.alertMessage}</p>
                                <small className="text-muted">
                                  <FaClock className="me-1" size={12} /> {formatDate(alert.lastUpdated)}
                                </small>
                              </div>
                            </ListGroup.Item>
                          ))
                        ) : (
                          <ListGroup.Item className="text-center text-muted">
                            No critical alerts at this time
                          </ListGroup.Item>
                        )}
                      </ListGroup>
                    </Card>
                  </Col>
                  
                  <Col md={4} className="mb-3">
                    <Card className="h-100" style={{ borderTop: '4px solid #d4a373' }}>
                      <Card.Header style={{ background: '#fffaf5', color: '#5c3b2a' }}>
                        <FaExclamationTriangle className="me-2" style={{ color: '#d4a373' }} /> 
                        High Risk Alerts ({highAlerts.length})
                      </Card.Header>
                      <ListGroup variant="flush">
                        {highAlerts.length > 0 ? (
                          highAlerts.map(alert => (
                            <ListGroup.Item key={alert._id} className="d-flex align-items-start">
                              {getAlertIcon(alert.riskLevel)}
                              <div className="ms-3 flex-grow-1">
                                <strong style={{ color: '#5c3b2a' }}>{alert.name}</strong>
                                <p className="mb-0 small text-muted">{alert.region}</p>
                                <p className="mb-0 mt-1 text-warning small">{alert.alertMessage}</p>
                                <small className="text-muted">
                                  <FaClock className="me-1" size={12} /> {formatDate(alert.lastUpdated)}
                                </small>
                              </div>
                            </ListGroup.Item>
                          ))
                        ) : (
                          <ListGroup.Item className="text-center text-muted">
                            No high risk alerts at this time
                          </ListGroup.Item>
                        )}
                      </ListGroup>
                    </Card>
                  </Col>
                  
                  <Col md={4} className="mb-3">
                    <Card className="h-100" style={{ borderTop: '4px solid #6b8c5c' }}>
                      <Card.Header style={{ background: '#f5f8f2', color: '#5c3b2a' }}>
                        <FaBell className="me-2" style={{ color: '#6b8c5c' }} /> 
                        Moderate Risk Alerts ({moderateAlerts.length})
                      </Card.Header>
                      <ListGroup variant="flush">
                        {moderateAlerts.length > 0 ? (
                          moderateAlerts.map(alert => (
                            <ListGroup.Item key={alert._id} className="d-flex align-items-start">
                              {getAlertIcon(alert.riskLevel)}
                              <div className="ms-3 flex-grow-1">
                                <strong style={{ color: '#5c3b2a' }}>{alert.name}</strong>
                                <p className="mb-0 small text-muted">{alert.region}</p>
                                <p className="mb-0 mt-1 text-info small">{alert.alertMessage}</p>
                                <small className="text-muted">
                                  <FaClock className="me-1" size={12} /> {formatDate(alert.lastUpdated)}
                                </small>
                              </div>
                            </ListGroup.Item>
                          ))
                        ) : (
                          <ListGroup.Item className="text-center text-muted">
                            No moderate alerts at this time
                          </ListGroup.Item>
                        )}
                      </ListGroup>
                    </Card>
                  </Col>
                </Row>
                
                <div className="mt-4 p-3" style={{ background: '#f5efe5', borderRadius: '12px' }}>
                  <h6 style={{ color: '#5c3b2a' }}>📋 Alert Summary</h6>
                  <Row>
                    <Col md={3} className="text-center">
                      <h3 style={{ color: '#9e5a3a' }}>{criticalAlerts.length}</h3>
                      <small className="text-muted">Critical Alerts</small>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 style={{ color: '#d4a373' }}>{highAlerts.length}</h3>
                      <small className="text-muted">High Risk Alerts</small>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 style={{ color: '#6b8c5c' }}>{moderateAlerts.length}</h3>
                      <small className="text-muted">Moderate Alerts</small>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 style={{ color: '#4a6b3f' }}>{locations.length - (criticalAlerts.length + highAlerts.length + moderateAlerts.length)}</h3>
                      <small className="text-muted">Normal Locations</small>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      <footer className="text-center py-4 mt-5" style={{ background: '#2c1810', color: '#e8e0d5' }}>
        <Container>
          <p className="mb-0">© 2024 FloodWatch Pro | Real-time Flood Monitoring System</p>
          <small>Monitoring {locations.length} locations | Alerts update every 5 minutes</small>
        </Container>
      </footer>
    </>
  );
}