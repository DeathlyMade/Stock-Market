import React, { useEffect, useState } from 'react';

// Function to fetch price changes for a stock
const getPriceChanges = (stockId) => {


    //check if price changes are present in local storage
    const priceChanges = localStorage.getItem('priceChanges');
    if (priceChanges) {
        const parsedChanges = JSON.parse(priceChanges);
        const changes = parsedChanges[stockId];
        if (changes) {
            console.log("Price changes from local storage:", changes);
            return Promise.resolve(changes);
        }
    }


  return fetch(`http://127.0.0.1:8000/api/stocks/${stockId}?with_prices=true`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('token')}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const prices = data.prices;

      // Get the most recent price (current price)
      const currentPrice = prices[0]?.close_price;
      const curr_date = prices[0]?.date;
      console.log("Current Date:", curr_date);

      // Find prices for the past 1 day, 1 week, 1 month, and 1 year
      const oneDayAgo = prices[1]?.close_price;
      const oneWeekAgo = prices[7]?.close_price;
      const oneMonthAgo = prices[30]?.close_price;
      const oneYearAgo = prices[365]?.close_price;
   
      //log all values to the console
      console.log("Current Price:", currentPrice);
      console.log("1 Day Ago:", oneDayAgo);
        console.log("1 Week Ago:", oneWeekAgo);
        console.log("1 Month Ago:", oneMonthAgo);
        console.log("1 Year Ago:", oneYearAgo);
       
        // Store the price changes in local storage if they are not already present
        let existingPriceChanges = localStorage.getItem('priceChanges');
        if (existingPriceChanges) {
            existingPriceChanges = JSON.parse(existingPriceChanges);
        } else {
            existingPriceChanges = {};
        }
        //Add the new price changes to the existing ones
        existingPriceChanges[stockId] = [
            currentPrice,
            oneDayAgo,
            oneWeekAgo,
            oneMonthAgo,
            oneYearAgo,
        ];
        localStorage.setItem('priceChanges', JSON.stringify(existingPriceChanges));
      return [
        currentPrice,
        oneDayAgo,
        oneWeekAgo,
        oneMonthAgo,
        oneYearAgo,
      ];
    })
    .catch(console.error);
};

const handleDownloadCSV = (stocks) => {
    const headers = ['Ticker', 'Current Price', '1D Ago', '1W Ago', '1M Ago', '1Y Ago'];
    const rows = stocks.map((stock) => {
      const priceData = priceChanges[stock.id] || [];
      return [
        stock.ticker,
        priceData[0],
        priceData[1],
        priceData[2],
        priceData[3],
        priceData[4],
      ];
    });
 
    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((item) => `"${item}"`).join(','))
        .join('\n');
 
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'stock_prices.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 


const thStyle = {
    padding: '10px',
    textAlign: 'left',
    background: '#eaeaea',
    borderBottom: '2px solid #ccc'
  };
 
  const tdStyle = {
    padding: '10px'
  };


function Watchlist() {
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceChanges, setPriceChanges] = useState({});

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/watchlists/3/', {
      headers: {
        Authorization: `Token ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setStocks(data.stocks);

        // Fetch price changes for each stock in the watchlist
        data.stocks.forEach((stock) => {
          getPriceChanges(stock.id).then((changes) => {
            setPriceChanges((prevPriceChanges) => ({
              ...prevPriceChanges,
              [stock.id]: changes,
            }));
          });
        });
      })
      .catch(() => setError('Error fetching watchlist'));
  }, []);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query.length > 1) {
      fetch(`http://127.0.0.1:8000/api/stocks/?search=${query}`, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setSearchResults(data))
        .catch(console.error);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddStock = (stockId) => {
    fetch(`http://127.0.0.1:8000/api/watchlists/3/${stockId}/`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${localStorage.getItem('token')}`,
      },
    })
      .then(() => window.location.reload())
      .catch(console.error);
  };

  const handleDownloadCSV = () => {
    const headers = ['Ticker', 'Current Price', '1D Ago', '1W Ago', '1M Ago', '1Y Ago'];
 
    // Load price changes from local storage
    const priceChanges = localStorage.getItem('priceChanges');
    const parsedChanges = JSON.parse(priceChanges);
 
    // Prepare CSV rows
    const rows = stocks.map((stock) => {
      const priceData = parsedChanges?.[stock.id] || [];
      return [
        stock.ticker,
        priceData[0],
        priceData[1],
        priceData[2],
        priceData[3],
        priceData[4],
      ];
    });
 
    // Build CSV content
    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((item) => `"${item}"`).join(','))
        .join('\n');
 
    // Create downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'stock_prices.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
 

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Watchlist</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div
        style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px',
          backgroundColor: '#fff',
        }}
      >
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search stock to add..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
        />

        {/* Search results */}
        {searchResults.length > 0 && (
          <div>
            <h5>Search Results</h5>
            {searchResults.map((stock) => (
              <div key={stock.id} style={{ marginBottom: '5px' }}>
                {stock.ticker}{' '}
                <button onClick={() => handleAddStock(stock.id)}>Add</button>
              </div>
            ))}
          </div>
        )}

        <h4>Stocks</h4>
            <button
            onClick={() => handleDownloadCSV(stocks)}
            style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#007bff', color: 'white', borderRadius: '5px', border: 'none' }}
            >
            Download CSV
            </button>

        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f9f9f9' }}>
            <thead>
            <tr>
                <th style={thStyle}>Ticker</th>
                <th style={thStyle}>Current Price</th>
                <th style={thStyle}>1 Day Ago</th>
                <th style={thStyle}>1 Week Ago</th>
                <th style={thStyle}>1 Month Ago</th>
                <th style={thStyle}>1 Year Ago</th>
                <th style={thStyle}>Action</th>
            </tr>
            </thead>
            <tbody>
            {stocks?.map((stock, index) => {
                const priceData = priceChanges[stock.id];
                const curr = priceData?.[0];

                const renderCell = (pastPrice) => {
                if (curr == null || pastPrice == null) return '-';
                const diff = curr - pastPrice;
                const percent = ((diff / pastPrice) * 100).toFixed(2);
                const color = diff > 0 ? 'green' : diff < 0 ? 'red' : 'gray';
                return (
                    <>
                    {pastPrice}
                    <span style={{ color, marginLeft: '5px' }}>
                        ({percent}%)
                    </span>
                    </>
                );
                };

                return (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}><strong>{stock.ticker}</strong></td>
                    <td style={tdStyle}>{curr ?? '-'}</td>
                    <td style={tdStyle}>{renderCell(priceData?.[1])}</td>
                    <td style={tdStyle}>{renderCell(priceData?.[2])}</td>
                    <td style={tdStyle}>{renderCell(priceData?.[3])}</td>
                    <td style={tdStyle}>{renderCell(priceData?.[4])}</td>
                    <td style={tdStyle}>
                    <button
                        onClick={() => handleDeleteStock(stock.id)}
                        style={{ color: 'red' }}
                    >
                        Delete
                    </button>
                    </td>
                </tr>
                );
            })}
            </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default Watchlist;