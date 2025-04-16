import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const layoutStyle = {
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
};

const contentWrapperStyle = {
  display: 'flex',
  flex: 1,
  marginTop: '60px', // Offset by the Header height
};

const contentStyle = {
  flex: 1,
  backgroundColor: '#f4f7fc',
  paddingLeft: '20px',
  paddingRight: '20px',
  paddingBottom: '20px',
  boxSizing: 'border-box',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
};


const sidebarContainerStyle = {
  position: 'relative',
  width: '250px',
  flexShrink: 0,
  // Ensure Sidebar stays within the flow and doesn't overlap
  minHeight: 'calc(100vh - 60px - 100px)', // Matches available space minus Header and Footer
};

function MainLayout({ children }) {
  return (
    <div style={layoutStyle}>
      <Header />
      <div style={contentWrapperStyle}>
        <div style={sidebarContainerStyle}>
          <Sidebar />
        </div>
        <main style={contentStyle}>
          <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default MainLayout;