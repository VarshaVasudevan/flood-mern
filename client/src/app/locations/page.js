'use client';

import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Form, Row, Col, Card, Pagination, InputGroup, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { FaSearch, FaSort, FaWater, FaTint, FaThermometerHalf, FaTachometerAlt } from 'react-icons/fa';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');
  const [sortBy, setSortBy] = useState('waterLevel');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    filterAndSortLocations();
  }, [searchTerm, filterRisk, filterRegion, sortBy, sortOrder, locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/locations');
      console.log('Fetched locations:', response.data.length);
      setLocations(response.data);
      setFilteredLocations(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to fetch locations. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortLocations = () => {
    let filtered = [...locations];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by risk level
    if (filterRisk !== 'All') {
      filtered = filtered.filter(l => l.riskLevel === filterRisk);
    }
    
    // Filter by region
    if (filterRegion !== 'All') {
      filtered = filtered.filter(l => l.region === filterRegion);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      }
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredLocations(filtered);
    setCurrentPage(1);
  };

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

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  // Get unique regions for filter
  const regions = ['All', ...new Set(locations.map(l => l.region))];
  const riskLevels = ['All', 'Low', 'Moderate', 'High', 'Critical'];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLocations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);

  if (loading) {
    return (
      <>
        <Navbar />
        <Container>
          <div className="text-center mt-5">
            <div className="loader"></div>
            <p className="mt-3" style={{ color: '#5c3b2a' }}>Loading locations...</p>
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
                <h5 className="mb-0" style={{ color: '#5c3b2a' }}>📍 All Monitoring Locations</h5>
                <p className="text-muted mb-0 small">Real-time flood data from {locations.length} locations across the region</p>
              </Card.Header>
              <Card.Body>
                {/* Filters Row */}
                <Row className="mb-4">
                  <Col md={4} className="mb-2">
                    <Form.Group>
                      <Form.Label style={{ color: '#5c3b2a' }}><FaSearch className="me-1" /> Search Location</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Search by name or region..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ borderColor: '#e8e0d5' }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-2">
                    <Form.Group>
                      <Form.Label style={{ color: '#5c3b2a' }}>Risk Level</Form.Label>
                      <Form.Select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value)}
                        style={{ borderColor: '#e8e0d5' }}
                      >
                        {riskLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-2">
                    <Form.Group>
                      <Form.Label style={{ color: '#5c3b2a' }}>Region</Form.Label>
                      <Form.Select
                        value={filterRegion}
                        onChange={(e) => setFilterRegion(e.target.value)}
                        style={{ borderColor: '#e8e0d5' }}
                      >
                        {regions.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="mb-2">
                    <Form.Group>
                      <Form.Label style={{ color: '#5c3b2a' }}><FaSort className="me-1" /> Sort By</Form.Label>
                      <Form.Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ borderColor: '#e8e0d5' }}
                      >
                        <option value="waterLevel">Water Level</option>
                        <option value="rainfall">Rainfall</option>
                        <option value="name">Name</option>
                        <option value="riskLevel">Risk Level</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                {/* Locations Table */}
                <div className="table-responsive">
                  <Table striped hover className="mb-0">
                    <thead style={{ background: '#f5efe5' }}>
                      <tr>
                        <th>Location Name</th>
                        <th>Region</th>
                        <th>Water Level</th>
                        <th>Rainfall</th>
                        <th>Temperature</th>
                        <th>Humidity</th>
                        <th>Risk Level</th>
                        <th>Status</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map(location => (
                        <tr key={location._id}>
                          <td>
                            <strong style={{ color: '#5c3b2a' }}>{location.name}</strong>
                            <br />
                            <small className="text-muted">{location.alertMessage.substring(0, 50)}...</small>
                          </td>
                          <td>{location.region}</td>
                          <td className={location.waterLevel > 5 ? 'text-danger fw-bold' : ''}>
                            <FaWater className="me-1" style={{ color: '#6b8c5c' }} /> {location.waterLevel} m
                          </td>
                          <td>
                            <FaTint className="me-1" style={{ color: '#d4a373' }} /> {location.rainfall} mm
                          </td>
                          <td>
                            <FaThermometerHalf className="me-1" /> {location.temperature}°C
                          </td>
                          <td>
                            <FaTachometerAlt className="me-1" /> {location.humidity}%
                          </td>
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
                          <td className="small">{formatDate(location.lastUpdated)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                
                {filteredLocations.length === 0 && (
                  <div className="text-center py-5">
                    <p style={{ color: '#5c3b2a' }}>No locations found matching your filters.</p>
                  </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="justify-content-center mt-4">
                    <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === currentPage}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    })}
                    
                    <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                  </Pagination>
                )}
                
                {/* Summary */}
                <div className="text-muted mt-3 text-center">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLocations.length)} of {filteredLocations.length} locations
                  {filteredLocations.length !== locations.length && ` (filtered from ${locations.length} total)`}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      <footer className="text-center py-4 mt-5" style={{ background: '#2c1810', color: '#e8e0d5' }}>
        <Container>
          <p className="mb-0">© 2024 FloodWatch Pro | Real-time Flood Monitoring System</p>
          <small>Monitoring {locations.length} locations | Data updates every 5 minutes</small>
        </Container>
      </footer>
    </>
  );
}