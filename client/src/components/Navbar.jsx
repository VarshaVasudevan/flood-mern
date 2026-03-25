'use client';

import React from 'react';
import { Container, Navbar as BootstrapNavbar, Nav } from 'react-bootstrap';
import { FaHome, FaChartLine, FaMapMarkedAlt, FaBell, FaWater } from 'react-icons/fa';
import Link from 'next/link';

const Navbar = () => {
  return (
    <BootstrapNavbar expand="lg" className="mb-4 sticky-top">
      <Container>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <BootstrapNavbar.Brand className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
            <FaWater className="me-2" size={28} style={{ color: '#6b8c5c' }} />
            <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
              FloodWatch Pro
            </span>
          </BootstrapNavbar.Brand>
        </Link>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Nav.Link as="span" className="mx-2">
                <FaHome className="me-1" /> Dashboard
              </Nav.Link>
            </Link>
            <Link href="/locations" style={{ textDecoration: 'none' }}>
              <Nav.Link as="span" className="mx-2">
                <FaChartLine className="me-1" /> All Locations
              </Nav.Link>
            </Link>
            <Link href="/map" style={{ textDecoration: 'none' }}>
              <Nav.Link as="span" className="mx-2">
                <FaMapMarkedAlt className="me-1" /> Map View
              </Nav.Link>
            </Link>
            <Link href="/alerts" style={{ textDecoration: 'none' }}>
              <Nav.Link as="span" className="mx-2">
                <FaBell className="me-1" /> Alerts
              </Nav.Link>
            </Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;