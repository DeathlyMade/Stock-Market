// Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const footerStyle = {
  backgroundColor: '#1a73e8',
  color: '#fff',
  padding: '40px 20px',
};

const containerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  maxWidth: '1200px',
  margin: '0 auto',
};

const columnStyle = {
  flex: '1 1 300px',
  margin: '20px',
};

const titleStyle = {
  fontSize: '1.2rem',
  marginBottom: '15px',
  fontWeight: 'bold',
};

const textStyle = {
  fontSize: '0.95rem',
  lineHeight: '1.6',
};

const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
  marginBottom: '10px',
  display: 'block',
};

function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={columnStyle}>
          <h4 style={titleStyle}>About Us</h4>
          <p style={textStyle}>
            Stock Portal is a leading provider of comprehensive stock market information, analysis, and financial insights. Our goal is to empower investors with reliable data and expert commentary.
          </p>
        </div>
        <div style={columnStyle}>
          <h4 style={titleStyle}>Contact Us</h4>
          <p style={textStyle}>Email: <a href="mailto:support@stockportal.com" style={linkStyle}>support@stockportal.com</a></p>
          <p style={textStyle}>Phone: +1 (555) 123-4567</p>
          <p style={textStyle}>Address: 123 Market Street,<br />Suite 456, City, Country</p>
        </div>
        <div style={columnStyle}>
          <h4 style={titleStyle}>Follow Us</h4>
          <a href="https://facebook.com" style={linkStyle} target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://twitter.com" style={linkStyle} target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://instagram.com" style={linkStyle} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://linkedin.com" style={linkStyle} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} Stock Portal. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
