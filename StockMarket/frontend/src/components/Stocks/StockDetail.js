import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

Chart.register(...registerables);

function StockDetail() {
  const { id } = useParams();
  const [stock, setStock] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [industryData, setIndustryData] = useState(null); // For pie and bar charts
  const [timeRange, setTimeRange] = useState('1D'); // Default time range
  const [isAddedToWatchlist, setIsAddedToWatchlist] = useState(false); // Watchlist flag

  // Fetch the stock details
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
        if (data.prices) {
          updateChartData(data.prices, timeRange);
        }
      })
      .catch((error) => console.error('Error fetching stock:', error));
  }, [id, timeRange]);

  // Fetch the watchlist to check if this stock is already added
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/watchlist/', {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Assuming the watchlist endpoint returns an object with a "stocks" property
        if (data.stocks && data.stocks.some((s) => s.id === parseInt(id))) {
          setIsAddedToWatchlist(true);
        }
      })
      .catch((error) => console.error('Error fetching watchlist:', error));
  }, [id]);

  // Fetch industry data for charts
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/stocks/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((stocks) => {
        const industryMap = {};
        stocks.forEach((stockItem) => {
          const industry = stockItem.industry;
          const performance =
            stockItem.latest_price.close_price - stockItem.latest_price.prev_close_price;
          if (!industryMap[industry]) {
            industryMap[industry] = { count: 0, totalPerformance: 0 };
          }
          industryMap[industry].count += 1;
          industryMap[industry].totalPerformance += performance;
        });
        const labels = Object.keys(industryMap);
        const counts = labels.map((industry) => industryMap[industry].count);
        const performances = labels.map((industry) => industryMap[industry].totalPerformance);
        setIndustryData({ labels, counts, performances });
      })
      .catch((error) => console.error('Error fetching industry data:', error));
  }, []);

  const handleAddToWatchlist = () => {
    // Do nothing if the stock is already added
    if (isAddedToWatchlist) return;

    // Note the trailing slash in the URL
    const url = `http://127.0.0.1:8000/api/watchlist/${stock.id}/`;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setIsAddedToWatchlist(true);
          alert(`${stock.ticker} has been added to your watchlist!`);
        } else {
          alert('Failed to add to watchlist. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error adding to watchlist:', error);
        alert('An error occurred. Please try again.');
      });
  };

  const updateChartData = (prices, range) => {
    let filteredPrices;
    // Filter prices based on the selected time range.
    switch (range) {
      case '1D':
        filteredPrices = prices.slice(0, 2);
        break;
      case '1W':
        filteredPrices = prices.slice(0, 7);
        break;
      case '1M':
        filteredPrices = prices.slice(0, 30);
        break;
      case '6M':
        filteredPrices = prices.slice(0, 180);
        break;
      case '1Y':
      default:
        filteredPrices = prices;
        break;
    }

    const labels = filteredPrices.map((item) => item.date).reverse();
    const pricesData = filteredPrices.map((item) => parseFloat(item.close_price)).reverse();
    const lineColor = pricesData[0] > pricesData[pricesData.length - 1] ? 'red' : 'green';

    setChartData({
      labels,
      datasets: [
        {
          label: 'Close Price',
          data: pricesData,
          borderColor: lineColor,
          backgroundColor:
            lineColor === 'red' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)',
          tension: 0.4,
          pointRadius: 0,
          fill: true,
        },
      ],
    });
  };

  if (!stock || !industryData) return <p style={{ padding: '20px' }}>Loading...</p>;

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {chartData && (
        <div style={{ marginTop: '40px', width: '100%', maxWidth: '800px' }}>
          <h3 style={{ color: '#1a73e8', textAlign: 'center' }}>
            {stock.company_name}
          </h3>
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
              {isAddedToWatchlist ? 'Already Added' : 'Add to Watchlist'}
            </button>
          </div>
        </div>
      )}

      {/* Pie Chart and Bar Graph Side-by-Side */}
      <div
        style={{
          marginTop: '40px',
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {/* Pie Chart */}
        <div
          style={{
            flex: 1,
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h3 style={{ color: '#1a73e8', textAlign: 'center' }}>Industry Distribution</h3>
          <Pie
            data={{
              labels: industryData.labels,
              datasets: [
                {
                  data: industryData.counts,
                  backgroundColor: industryData.labels.map(
                    (_, index) => `hsl(${(index * 137.5) % 360}, 70%, 50%)`
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
        <div
          style={{
            flex: 1,
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h3 style={{ color: '#1a73e8', textAlign: 'center' }}>Industry Performance</h3>
          <Bar
            data={{
              labels: industryData.labels,
              datasets: [
                {
                  label: `${stock.ticker} Industry Performance`,
                  data: industryData.labels.map((industry) =>
                    industry === stock.industry
                      ? industryData.performances[industryData.labels.indexOf(industry)]
                      : 0
                  ),
                  backgroundColor: '#FF6384',
                },
                {
                  label: 'Other Industries',
                  data: industryData.labels.map((industry) =>
                    industry !== stock.industry
                      ? industryData.performances[industryData.labels.indexOf(industry)]
                      : 0
                  ),
                  backgroundColor: '#36A2EB',
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
                      const performance = industryData.performances[tooltipItem.dataIndex];
                      return `${industry}: ${performance.toFixed(2)} performance`;
                    },
                  },
                },
              },
            }}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}

export default StockDetail;