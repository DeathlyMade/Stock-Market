import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

Chart.register(...registerables);

function StockDetail() {
  const { id } = useParams();
  const [stock, setStock] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [industryData, setIndustryData] = useState(null); // Data for pie and bar charts
  const [timeRange, setTimeRange] = useState('1D'); // Default time range is 1 day
  const [isAddedToWatchlist, setIsAddedToWatchlist] = useState(false); // Track watchlist status

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/stocks/${id}?with_prices=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setStock(data);

        // Extract dates and close prices from the prices array
        if (data.prices) {
          updateChartData(data.prices, timeRange); // Update chart data based on the selected time range
        }
      })
      .catch((error) => console.error('Error fetching stock:', error));
  }, [id, timeRange]); // Re-run effect when timeRange changes

  useEffect(() => {
    // Fetch all stocks to calculate industry-wise performance
    fetch(`http://127.0.0.1:8000/api/stocks/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((stocks) => {
        const industryMap = {};

        // Group stocks by industry and calculate performance
        stocks.forEach((stock) => {
          const industry = stock.industry;
          const performance = stock.latest_price.close_price - stock.latest_price.prev_close_price;

          if (!industryMap[industry]) {
            industryMap[industry] = { count: 0, totalPerformance: 0 };
          }

          industryMap[industry].count += 1;
          industryMap[industry].totalPerformance += performance;
        });

        // Prepare data for charts
        const labels = Object.keys(industryMap);
        const counts = labels.map((industry) => industryMap[industry].count);
        const performances = labels.map((industry) => industryMap[industry].totalPerformance);

        setIndustryData({ labels, counts, performances });
      })
      .catch((error) => console.error('Error fetching industry data:', error));
  }, []);
  console.log(stock);
  const handleAddToWatchlist = () => {
    const url = `http://127.0.0.1:8000/api/watchlists/3/${stock.id}/`;
  
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('token')}`,
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

  const updateChartData = (prices, range) => {
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

    const labels = filteredPrices.map((item) => item.date).reverse(); // Dates for the x-axis
    const pricesData = filteredPrices.map((item) => parseFloat(item.close_price)).reverse(); // Close prices for the y-axis

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

  if (!stock || !industryData) return <p style={{ padding: '20px' }}>Loading...</p>;

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {chartData && (
        <div style={{ marginTop: '40px', width: '100%', maxWidth: '800px' }}>
          <h3 style={{ color: '#1a73e8', textAlign: 'center' }}>{stock.company_name}</h3>
  
          {/* Time Range Buttons */}
          <div style={{ margin: '20px 0', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {['1Y', '6M', '1M', '1W', '1D'].map((range) => (
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
  
      {/* Pie Chart and Bar Graph Side-by-Side */}
<div style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center', width: '100%' }}>
  {/* Pie Chart */}
<div style={{ flex: 1, maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <h3 style={{ color: '#1a73e8', textAlign: 'center' }}>Industry Distribution</h3>
  <Pie
    data={{
      labels: industryData.labels,
      datasets: [
        {
          data: industryData.counts,
          backgroundColor: industryData.labels.map(
            (_, index) => `hsl(${(index * 137.5) % 360}, 70%, 50%)` // Generate contrasting colors using the golden angle
          ),
        },
      ],
    }}
    options={{
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const industry = industryData.labels[tooltipItem.dataIndex];
              const count = industryData.counts[tooltipItem.dataIndex];
              return `${industry}: ${count} stocks`;
            },
          },
        },
      },
    }}
  />
</div>

{/* Bar Graph */}
<div style={{ flex: 1, maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <h3 style={{ color: '#1a73e8', textAlign: 'center' }}>Industry Performance</h3>
  <Bar
    data={{
      labels: industryData.labels,
      datasets: [
        {
          label: `${stock.ticker} Industry Performance`,
          data: industryData.labels.map((industry) =>
            industry === stock.industry ? industryData.performances[industryData.labels.indexOf(industry)] : 0
          ),
          backgroundColor: '#FF6384', // Highlight color for the current stock's industry
        },
        {
          label: 'Other Industries',
          data: industryData.labels.map((industry) =>
            industry !== stock.industry ? industryData.performances[industryData.labels.indexOf(industry)] : 0
          ),
          backgroundColor: '#36A2EB', // Color for other industries
        },
      ],
    }}
    options={{
      responsive: true,
      plugins: {
        legend: {
          position: 'top', // Display legends at the top
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const industry = industryData.labels[tooltipItem.dataIndex];
              const performance = industryData.performances[tooltipItem.dataIndex];
              return `${industry}: ${performance.toFixed(2)} performance`;
            },
          },
        },
      },
    }}
    height={300} // Adjust height to fill the div
  />
</div>
</div>
    </div>
  );
}

export default StockDetail;