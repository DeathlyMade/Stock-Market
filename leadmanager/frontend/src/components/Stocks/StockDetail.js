import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(...registerables);

function StockDetail() {
  const { id } = useParams();
  const [stock, setStock] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/stocks/${id}?with_prices=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
      }
    })
      .then(res => res.json())
      .then(data => {
        setStock(data);

        // Extract dates and close prices from the prices array
        if (data.prices) {
          const labels = data.prices.map(item => item.date); // Dates for the x-axis
          const prices = data.prices.map(item => parseFloat(item.close_price)); // Close prices for the y-axis

          setChartData({
            labels,
            datasets: [
              {
                label: 'Close Price',
                data: prices,
                borderColor: '#1a73e8',
                backgroundColor: 'rgba(26, 115, 232, 0.2)',
                tension: 0.4, // Smooth curve
              },
            ],
          });
        }
      })
      .catch(error => console.error('Error fetching stock:', error));
  }, [id]);

  if (!stock) return <p style={{ padding: '20px' }}>Loading...</p>;

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  {chartData && (
    <div style={{ marginTop: '40px', width: '100%', maxWidth: '800px' }}>
      <h3 style={{ color: '#1a73e8', textAlign: 'center' }}>Stock Price History</h3>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Stock Price Over Time',
            },
          },
        }}
      />
    </div>
  )}
</div>
  );
}

export default StockDetail;