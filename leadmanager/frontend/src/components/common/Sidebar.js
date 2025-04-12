// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const sidebarStyle = {
  width: '250px',
  backgroundColor: '#fff',
  borderRight: '1px solid #ddd',
  paddingTop: '20px',
  position: 'fixed',
  top: '60px',
  bottom: 0,
  left: 0,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const linkStyle = {
  display: 'block',
  padding: '10px 20px',
  textDecoration: 'none',
  color: '#333',
  borderBottom: '1px solid #eee',
};

function Sidebar() {
  return (
    <aside style={sidebarStyle}>
      <Link to="/stocks" style={linkStyle}>Stocks</Link>
      <Link to="/about" style={linkStyle}>About</Link>
      <Link to="/contact" style={linkStyle}>Contact</Link>
    </aside>
  );
}

export default Sidebar;
