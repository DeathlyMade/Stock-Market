import React from 'react';
import { Link } from 'react-router-dom';

const sidebarStyle = {
  width: '250px',
  backgroundColor: '#fff',
  borderRight: '1px solid #ddd',
  //paddingTop: '20px',
  position: 'relative', // Keep relative positioning
  top: 0,
  // Adjust max-height to fit within the container
  maxHeight: 'calc(100vh - 60px - 100px)', // Subtract Header (60px) and estimated Footer (100px)
  overflowY: 'auto', // Enable scrolling if content exceeds height
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const linkStyle = {
  display: 'block',
  padding: '15px 25px',
  textDecoration: 'none',
  color: '#333',
  borderBottom: '1px solid #eee',
  fontSize: '1.2rem',
  fontWeight: 'bold',
};

function Sidebar() {
  return (
    <aside style={sidebarStyle}>
      <Link to="/stocks" style={linkStyle}>Dashboard</Link>
      <Link to="/portfolios" style={linkStyle}>Portfolio</Link>
      <Link to="/watchlist" style={linkStyle}>Watchlist</Link>
    </aside>
  );
}

export default Sidebar;