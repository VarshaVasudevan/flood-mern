'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { FaWater, FaTint, FaExclamationTriangle, FaThermometerHalf, FaLeaf, FaTree } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching data from server...');
      const [locationsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/locations'),
        axios.get('http://localhost:5000/api/locations/statistics')
      ]);
      
      console.log('Locations received:', locationsRes.data.length);
      console.log('First location sample:', locationsRes.data[0]);
      
      setLocations(locationsRes.data);
      setStats(statsRes.data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to connect to backend server. Please make sure the server is running on port 5000');
      setLoading(false);
    }
  };

  // Rest of the component remains the same...
  
  const getRiskColor = (risk) => {
    const colors = {
      'Critical': 'danger',
      'High': 'warning',
      'Moderate': 'info',
      'Low': 'success'
    };
    return colors[risk] || 'secondary';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Evacuation': return 'danger';
      case 'Warning': return 'warning';
      case 'Alert': return 'info';
      default: return 'success';
    }
  };

  const barChartData = {
    labels: locations.slice(0, 10).map(l => l.name ? l.name.substring(0, 15) : 'Unknown'),
    datasets: [
      {
        label: 'Water Level (m)',
        data: locations.slice(0, 10).map(l => l.waterLevel || 0),
        backgroundColor: '#6b8c5c',
        borderColor: '#4a6b3f',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Rainfall (mm)',
        data: locations.slice(0, 10).map(l => l.rainfall || 0),
        backgroundColor: '#d4a373',
        borderColor: '#b97f4b',
        borderWidth: 1,
        borderRadius: 8,
      }
    ],
  };

  const doughnutData = {
    labels: ['Low Risk', 'Moderate Risk', 'High Risk', 'Critical'],
    datasets: [
      {
        data: [
          stats?.lowLocations || 0,
          stats?.moderateLocations || 0,
          stats?.highRiskLocations || 0,
          stats?.criticalLocations || 0
        ],
        backgroundColor: ['#4a6b3f', '#6b8c5c', '#d4a373', '#9e5a3a'],
        borderWidth: 0,
        cutout: '65%',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#5c3b2a'
        }
      },
      tooltip: {
        backgroundColor: '#2c1810',
        titleColor: '#faf7f0',
        bodyColor: '#e8e0d5'
      }
    },
    scales: {
      y: {
        grid: {
          color: '#e8e0d5'
        },
        ticks: {
          color: '#5c3b2a'
        }
      },
      x: {
        grid: {
          color: '#e8e0d5'
        },
        ticks: {
          color: '#5c3b2a'
        }
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container>
          <div className="text-center mt-5">
            <div className="loader"></div>
            <p className="mt-3" style={{ color: '#5c3b2a' }}>Loading flood monitoring data...</p>
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
            <Alert.Heading>Connection Error!</Alert.Heading>
            <p>{error}</p>
            <hr />
            <p className="mb-0">
              Please start the backend server by running:<br />
              <code>cd server && npm run dev</code>
            </p>
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
            <Alert.Heading>No Data Available</Alert.Heading>
            <p>No location data found. Please check the backend server and database.</p>
            <hr />
            <p className="mb-0">Make sure MongoDB is running and the server is generating data.</p>
          </Alert>
        </Container>
      </>
    );
  }

  const criticalLocations = locations.filter(l => l.riskLevel === 'Critical');

  return (
    <>
      <Navbar />
      <Container fluid className="px-4">
        {criticalLocations.length > 0 && (
          <Alert variant="danger" className="mb-4 critical-alert">
            <Alert.Heading>
              <FaExclamationTriangle className="me-2" /> CRITICAL ALERT!
            </Alert.Heading>
            <p>{criticalLocations.length} location(s) require immediate attention! Evacuation orders may be in effect.</p>
            <hr />
            <p className="mb-0">
              Affected areas: {criticalLocations.map(l => l.name).join(', ')}
            </p>
          </Alert>
        )}
        
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <Card.Title>Total Locations</Card.Title>
                <h1 className="display-4">{stats?.totalLocations || 0}</h1>
                <FaTree size={50} className="position-absolute end-0 bottom-0 me-3 mb-3 opacity-50" />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card style={{ background: 'linear-gradient(135deg, #9e5a3a 0%, #7e462c 100%)', color: 'white' }}>
              <Card.Body>
                <Card.Title>Critical Risk</Card.Title>
                <h1 className="display-4">{stats?.criticalLocations || 0}</h1>
                <FaExclamationTriangle size={50} className="position-absolute end-0 bottom-0 me-3 mb-3 opacity-50" />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card style={{ background: 'linear-gradient(135deg, #d4a373 0%, #c4925e 100%)', color: '#2c1810' }}>
              <Card.Body>
                <Card.Title>High Risk</Card.Title>
                <h1 className="display-4">{stats?.highRiskLocations || 0}</h1>
                <FaTint size={50} className="position-absolute end-0 bottom-0 me-3 mb-3 opacity-50" />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card style={{ background: 'linear-gradient(135deg, #6b8c5c 0%, #4a6b3f 100%)', color: 'white' }}>
              <Card.Body>
                <Card.Title>Avg Water Level</Card.Title>
                <h1 className="display-4">{stats?.averageWaterLevel?.toFixed(2) || 0} m</h1>
                <FaLeaf size={50} className="position-absolute end-0 bottom-0 me-3 mb-3 opacity-50" />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mb-4">
          <Col lg={8} className="mb-3">
            <Card>
              <Card.Header>
                <h5 className="mb-0">📊 Top 10 Locations - Water Level & Rainfall</h5>
              </Card.Header>
              <Card.Body>
                <Bar data={barChartData} options={chartOptions} />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} className="mb-3">
            <Card>
              <Card.Header>
                <h5 className="mb-0">🎯 Risk Distribution</h5>
              </Card.Header>
              <Card.Body className="text-center">
                <Doughnut data={doughnutData} options={chartOptions} />
                <div className="mt-3">
                  <Badge bg="success" className="me-2">Low: {stats?.lowLocations || 0}</Badge>
                  <Badge bg="info" className="me-2">Moderate: {stats?.moderateLocations || 0}</Badge>
                  <Badge bg="warning" className="me-2">High: {stats?.highRiskLocations || 0}</Badge>
                  <Badge bg="danger">Critical: {stats?.criticalLocations || 0}</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">⚠️ High Risk & Critical Locations</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Location Name</th>
                      <th>Region</th>
                      <th>Water Level (m)</th>
                      <th>Rainfall (mm)</th>
                      <th>Risk Level</th>
                      <th>Status</th>
                      <th>Alert Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.filter(l => l.riskLevel === 'High' || l.riskLevel === 'Critical').map(location => (
                      <tr key={location._id}>
                        <td><strong>{location.name}</strong></td>
                        <td>{location.region}</td>
                        <td className={location.waterLevel > 5 ? 'text-danger fw-bold' : ''}>
                          {location.waterLevel} m
                        </td>
                        <td>{location.rainfall} mm</td>
                        <td>
                          <Badge bg={getRiskColor(location.riskLevel)}>
                            {location.riskLevel}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getStatusColor(location.status)}>
                            {location.status}
                          </Badge>
                        </td>
                        <td className="text-muted small">{location.alertMessage}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
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