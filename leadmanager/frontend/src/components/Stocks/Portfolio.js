import React, { useEffect, useState } from 'react';

function Portfolio() {
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState({});
  const [searchQuery, setSearchQuery] = useState({});

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/portfolios/', {
      headers: {
        Authorization: `Token ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then(setPortfolios)
      .catch(() => setError('Error fetching portfolios'));
  }, []);

  const handleSearchChange = (portfolioId, query) => {
    setSearchQuery((prev) => ({ ...prev, [portfolioId]: query }));
    if (query.length > 1) {
      fetch(`http://127.0.0.1:8000/api/stocks/?search=${query}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        }
      })
        .then((res) => res.json())
        .then((data) => setSearchResults((prev) => ({ ...prev, [portfolioId]: data })))
        .catch(console.error);
    } else {
      setSearchResults((prev) => ({ ...prev, [portfolioId]: [] }));
    }
  };

  const handleAddStock = (portfolioId, stockId) => {
    const payload = {
      buy_price: 10,
      shares: 100,
    };
    fetch(`http://127.0.0.1:8000/api/portfolios/${portfolioId}/${stockId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
    })
      .then(() => window.location.reload())
      .catch(console.error);
  };

  const handleDeleteStock = (portfolioId, stockId) => {
    fetch(`http://127.0.0.1:8000/api/portfolios/${portfolioId}/${stockId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${localStorage.getItem('token')}`,
      },
    })
      .then(() => window.location.reload())
      .catch(console.error);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>My Portfolios</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {portfolios.map((portfolio) => (
        <div
          key={portfolio.id}
          style={{
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '30px',
            backgroundColor: '#fff',
          }}
        >
          <h3>{portfolio.name}</h3>
          <p>{portfolio.description}</p>

          {/* Search bar */}
          <input
            type="text"
            placeholder="Search stock to add..."
            value={searchQuery[portfolio.id] || ''}
            onChange={(e) => handleSearchChange(portfolio.id, e.target.value)}
            style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
          />

          {/* Search results */}
          {searchResults[portfolio.id]?.length > 0 && (
            <div>
              <h5>Search Results</h5>
              {searchResults[portfolio.id].map((stock) => (
                <div key={stock.id} style={{ marginBottom: '5px' }}>
                  {stock.ticker}{' '}
                  <button onClick={() => handleAddStock(portfolio.id, stock.id)}>Add</button>
                </div>
              ))}
            </div>
          )}

          <h4>Stocks</h4>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {portfolio.stocks?.map((stock, index) => (
              <div
                key={index}
                style={{
                  flex: '1 1 250px',
                  border: '1px solid #eee',
                  padding: '15px',
                  borderRadius: '10px',
                  background: '#f9f9f9',
                }}
              >
                <strong>{stock.ticker}</strong>
                <p>Buy Price: {stock.buy_price}</p>
                <p>Shares: {stock.shares}</p>
                <button onClick={() => handleDeleteStock(portfolio.id, stock.id)} style={{ color: 'red' }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Portfolio;
