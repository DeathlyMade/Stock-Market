import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function StockList() {
  const [stocks, setStocks] = useState([]);
  const [sortOption, setSortOption] = useState('name'); // Default sort option

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

  // Sort stocks based on the selected option
  const sortedStocks = [...stocks].sort((a, b) => {
    if (sortOption === 'name') {
      return a.company_name.localeCompare(b.company_name); // Sort alphabetically by name
    } else if (sortOption === 'performance') {
      const aPerformance = ((a.latest_price.close_price - a.latest_price.prev_close_price)/a.latest_price.prev_close_price)*100;
      const bPerformance = ((b.latest_price.close_price - b.latest_price.prev_close_price)/b.latest_price.prev_close_price)*100;
      return bPerformance - aPerformance; // Sort by performance (descending)
    }
    return 0;
  });

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
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    justifyContent: 'center',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: '15px',
    padding: '20px',
    width: '100%',
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

  const percentageStyle = (isIncrease) => ({
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: isIncrease ? 'green' : 'red',
  });

  const sortContainerStyle = {
    display: 'flex',
    justifyContent: 'left',
    marginBottom: '20px',
  };

  const sortSelectStyle = {
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Stock List</h2>

      {/* Sort Dropdown */}
      <div style={sortContainerStyle}>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={sortSelectStyle}
        >
          <option value="name">Sort by Name</option>
          <option value="performance">Sort by Performance</option>
        </select>
      </div>

      <div style={listContainerStyle}>
        {sortedStocks.map(stock => {
          const prevClose = parseFloat(stock.latest_price.prev_close_price);
          const close = parseFloat(stock.latest_price.close_price);
          const percentageChange = ((close - prevClose) / prevClose) * 100;
          const isIncrease = percentageChange > 0;

          return (
            <Link
              to={`/stocks/${stock.id}`}
              key={stock.id}
              style={{ ...cardStyle, textDecoration: 'none', color: 'inherit' }}
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
              <div style={percentageStyle(isIncrease)}>
                {isIncrease
                  ? `+${percentageChange.toFixed(2)}%`
                  : `${percentageChange.toFixed(2)}%`}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default StockList;