// Navbar.js
import React from 'react';

const navbarStyle = {
  position: 'fixed',
  top: 0,
  width: '100%',
  height: '60px',
  backgroundColor: '#1a73e8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  color: '#fff',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
};

const navLinkStyle = {
  color: '#fff',
  textDecoration: 'none',
  marginRight: '15px',
  fontSize: '1rem',
};

function Navbar() {
  return (
    <header style={navbarStyle}>
      <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Stock Portal</div>
      <nav>
        <a href="/stocks" style={navLinkStyle}>Home</a>
        <a href="/about" style={navLinkStyle}>About</a>
      </nav>
    </header>
  );
}

export default Navbar;
