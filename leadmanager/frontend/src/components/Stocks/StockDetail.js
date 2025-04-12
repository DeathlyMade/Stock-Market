import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(...registerables);

function StockDetail() {
  const { id } = useParams();
  const [stock, setStock] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [timeRange, setTimeRange] = useState('1Y'); // Default time range is 1 year
  const [isAddedToWatchlist, setIsAddedToWatchlist] = useState(false); // Track watchlist status

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
          updateChartData(data.prices, timeRange); // Update chart data based on the selected time range
        }
      })
      .catch(error => console.error('Error fetching stock:', error));
  }, [id, timeRange]); // Re-run effect when timeRange changes

  const updateChartData = (prices, range) => {
    const now = new Date();
    let filteredPrices;

    // Filter prices based on the selected time range
    switch (range) {
      case '1D': // Last 1 day
        filteredPrices = prices.slice(0, 2); // Assuming the API provides daily data
        break;
      case '1W': // Last 1 week
        filteredPrices = prices.slice(0, 7);
        break;
      case '1M': // Last 1 month
        filteredPrices = prices.slice(0, 30);
        break;
      case '6M': // Last 6 months
        filteredPrices = prices.slice(0, 180);
        break;
      case '1Y': // Last 1 year
      default:
        filteredPrices = prices; // Use all data for 1 year
        break;
    }

    const labels = filteredPrices.map(item => item.date).reverse(); // Dates for the x-axis
    const pricesData = filteredPrices.map(item => parseFloat(item.close_price)).reverse(); // Close prices for the y-axis

    // Determine the line color based on the first and last close prices
    const lineColor = pricesData[0] > pricesData[pricesData.length - 1] ? 'red' : 'green';

    setChartData({
      labels,
      datasets: [
        {
          label: 'Close Price',
          data: pricesData,
          borderColor: lineColor, // Set the line color dynamically
          backgroundColor: lineColor === 'red' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)', // Lightly color the area
          tension: 0.4, // Smooth curve
          pointRadius: 0, // Remove data points
          fill: true, // Fill the area under the line
        },
      ],
    });
  };

  const handleAddToWatchlist = () => {
    // Replace with your API endpoint
    const url = `http://127.0.0.1:8000/api/watchlists/3/${stock.id}/`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('token')}`, // Include token if required
      },
    })
      .then(response => {
        if (response.ok) {
          setIsAddedToWatchlist(true);
          alert(`${stock.ticker} has been added to your watchlist!`);
        } else {
          alert('Failed to add to watchlist. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error adding to watchlist:', error);
        alert('An error occurred. Please try again.');
      });
  };

  if (!stock) return <p style={{ padding: '20px' }}>Loading...</p>;

return (
  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    {chartData && (
      <div style={{ marginTop: '40px', width: '100%', maxWidth: '800px' }}>
        <h3 style={{ color: '#1a73e8', textAlign: 'center' }}>{stock.company_name}</h3>

        {/* Time Range Buttons */}
        <div style={{ margin: '20px 0', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {['1D', '1W', '1M', '6M', '1Y'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '10px 20px',
                backgroundColor: timeRange === range ? '#1a73e8' : '#f4f4f4',
                color: timeRange === range ? '#fff' : '#333',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {range}
            </button>
          ))}
        </div>

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

        {/* Add to Watchlist Button */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={handleAddToWatchlist}
            disabled={isAddedToWatchlist}
            style={{
              padding: '10px 20px',
              backgroundColor: isAddedToWatchlist ? '#ccc' : '#1a73e8',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: isAddedToWatchlist ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {isAddedToWatchlist ? 'Added to Watchlist' : 'Add to Watchlist'}
          </button>
        </div>
      </div>
    )}
  </div>
);
}
export default StockDetail;