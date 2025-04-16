import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const thStyle = {
    padding: '10px',
    textAlign: 'left',
    background: '#eaeaea',
    borderBottom: '2px solid #ccc',
};

const tdStyle = {
    padding: '10px',
};

function Watchlist() {
    const [stocks, setStocks] = useState([]);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Helper function to fetch watchlist data
    const fetchWatchlist = () => {
        fetch('http://127.0.0.1:8000/api/watchlist/', {
            headers: {
                Authorization: `Token ${localStorage.getItem('token')}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setStocks(data.stocks || []);
            })
            .catch(() => setError('Error fetching watchlist'));
    };

    // Fetch watchlist on component mount.
    useEffect(() => {
        fetchWatchlist();
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

    // Use POST method to add a stock and update state afterward.
    const handleAddStock = (stockId) => {
        fetch(`http://127.0.0.1:8000/api/watchlist/${stockId}`, {
            method: 'POST',
            headers: {
                Authorization: `Token ${localStorage.getItem('token')}`,
            },
        })
            .then(() => fetchWatchlist())
            .catch(console.error);
    };

    // Define handleDeleteStock to remove a stock from the watchlist.
    const handleDeleteStock = (stockId) => {
        fetch(`http://127.0.0.1:8000/api/watchlist/${stockId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Token ${localStorage.getItem('token')}`,
            },
        })
            .then(() => fetchWatchlist())
            .catch(console.error);
    };

    const handleDownloadCSV = () => {
        const headers = ['Ticker', 'Latest Price', 'Week Before Price', 'Month Before Price', 'Year Before Price'];
        const rows = stocks.map((stock) => {
            return [
                stock.ticker,
                stock.latest_price ? stock.latest_price.close_price : '-',
                stock.week_before_price ? stock.week_before_price.close_price : '-',
                stock.month_before_price ? stock.month_before_price.close_price : '-',
                stock.year_before_price ? stock.year_before_price.close_price : '-',
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

    // Helper to render a cell with past price and calculated percentage change.
    const renderChangeCell = (latestPrice, pastPrice) => {
        if (!latestPrice || !pastPrice) return '-';
        const current = parseFloat(latestPrice.close_price);
        const past = parseFloat(pastPrice.close_price);
        if (!past) return '-';
        const diff = current - past;
        const percent = ((diff / past) * 100).toFixed(2);
        const color = diff > 0 ? 'green' : diff < 0 ? 'red' : 'gray';
        return (
            <>
                {past} <span style={{ color, marginLeft: '5px' }}>({percent}%)</span>
            </>
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ textAlign: 'center' }}>Watchlist</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f9f9f9' }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Ticker</th>
                            <th style={thStyle}>Latest Price</th>
                            <th style={thStyle}>Week Before Price</th>
                            <th style={thStyle}>Month Before Price</th>
                            <th style={thStyle}>Year Before Price</th>
                            <th style={thStyle}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks?.map((stock, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={tdStyle}>
                                    <Link
                                        to={`/stocks/${stock.id}`}
                                        style={{ textDecoration: 'none', color: '#1a73e8' }}
                                    >
                                        <strong>{stock.ticker}</strong>
                                    </Link>
                                </td>
                                <td style={tdStyle}>
                                    {stock.latest_price ? stock.latest_price.close_price : '-'}
                                </td>
                                <td style={tdStyle}>
                                    {stock.week_before_price && stock.latest_price
                                        ? renderChangeCell(stock.latest_price, stock.week_before_price)
                                        : '-'}
                                </td>
                                <td style={tdStyle}>
                                    {stock.month_before_price && stock.latest_price
                                        ? renderChangeCell(stock.latest_price, stock.month_before_price)
                                        : '-'}
                                </td>
                                <td style={tdStyle}>
                                    {stock.year_before_price && stock.latest_price
                                        ? renderChangeCell(stock.latest_price, stock.year_before_price)
                                        : '-'}
                                </td>
                                <td style={tdStyle}>
                                    <button onClick={() => handleDeleteStock(stock.id)} style={{ color: 'red' }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Search and Add Stocks */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <input
                    type="text"
                    placeholder="Search stocks..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    style={{ padding: '8px', width: '300px', marginRight: '10px' }}
                />
                {searchResults.length > 0 && (
                    <div style={{ background: '#fff', padding: '10px', marginTop: '10px' }}>
                        {searchResults.map((stock) => {
                            // Check if the stock is already in the watchlist
                            const alreadyAdded = stocks.some((wStock) => wStock.id === stock.id);
                            return (
                                <div key={stock.id} style={{ marginBottom: '5px' }}>
                                    {stock.ticker}{' '}
                                    {alreadyAdded ? (
                                        <span style={{ color: 'gray', fontStyle: 'italic' }}>Already Added</span>
                                    ) : (
                                        <button onClick={() => handleAddStock(stock.id)} style={{ color: '#1a73e8' }}>
                                            Add to Watchlist
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                    onClick={handleDownloadCSV}
                    style={{
                        padding: '10px 20px',
                        background: '#1a73e8',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    Download CSV
                </button>
            </div>
        </div>
    );
}

export default Watchlist;