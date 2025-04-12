// StockList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function StockList() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/stocks', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
      }
    })
      .then(res => res.json())
      .then(data => setStocks(data))
      .catch(error => console.error('Error:', error));
  }, []);

  const containerStyle = {
    padding: '20px',
    backgroundColor: '#f4f7fc',
    minHeight: 'calc(100vh - 60px)',
  };

  const titleStyle = {
    textAlign: 'center',
    fontSize: '2rem',
    color: '#333',
    marginBottom: '20px',
  };

  const listContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: '15px',
    padding: '20px',
    width: '250px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    textAlign: 'center',
  };

  const tickerStyle = {
    fontSize: '1.8rem',
    color: '#1a73e8',
    marginBottom: '10px',
    fontWeight: 'bold',
  };

  const companyStyle = {
    fontSize: '1.1rem',
    color: '#555',
    marginBottom: '15px',
  };

  const linkStyle = {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'background-color 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Stock List</h2>
      <div style={listContainerStyle}>
        {stocks.map(stock => (
          <div
            key={stock.id}
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
            }}
          >
            <h3 style={tickerStyle}>{stock.ticker}</h3>
            <p style={companyStyle}>{stock.company_name}</p>
            <Link
              to={`/stocks/${stock.id}`}
              style={linkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1558b0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a73e8';
              }}
            >
              Show More
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StockList;
