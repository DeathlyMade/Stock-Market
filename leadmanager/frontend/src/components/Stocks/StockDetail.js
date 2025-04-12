// StockDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function StockDetail() {
  const { id } = useParams();
  const [stock, setStock] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/stocks/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Token 61c91c84f429b78a7f1ed6ae3d54c158bf621d7720d963a12da166c19290d8f8'
      }
    })
      .then(res => res.json())
      .then(data => setStock(data))
      .catch(error => console.error('Error fetching stock:', error));
  }, [id]);

  if (!stock) return <p style={{ padding: '20px' }}>Loading...</p>;

  return (
    <div style={{ padding: '20px', marginLeft: '250px' }}>
      <h2 style={{ color: '#1a73e8' }}>
        {stock.company_name} <span style={{ fontSize: '1rem', color: '#555' }}>({stock.ticker})</span>
      </h2>
      <p>Series: {stock.series}</p>
      <p>ID: {stock.id}</p>
      <Link to="/stocks" style={{ color: '#1a73e8', textDecoration: 'none' }}>← Back to Stock List</Link>
    </div>
  );
}

export default StockDetail;
