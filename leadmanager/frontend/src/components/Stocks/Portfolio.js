import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'regenerator-runtime/runtime';

function Portfolio() {
  const [portfolios, setPortfolios] = useState([]);
  const [error, setError] = useState(null);

  // For searching & adding stocks
  const [searchResults, setSearchResults] = useState({});
  const [searchQuery, setSearchQuery] = useState({});
  const [addingStock, setAddingStock] = useState(null); // { portfolioId, stockId }
  const [formValues, setFormValues] = useState({ buy_price: '', shares: '' });

  // For creating new portfolio
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioDescription, setNewPortfolioDescription] = useState('');

  // For editing an existing portfolio
  const [editPortfolioId, setEditPortfolioId] = useState(null);
  const [editPortfolioName, setEditPortfolioName] = useState('');
  const [editPortfolioDescription, setEditPortfolioDescription] = useState('');

  // ------------------------------------------------------------
  // 1) Fetch Portfolios
  // ------------------------------------------------------------
  const fetchPortfolios = () => {
    fetch('http://127.0.0.1:8000/api/portfolios/', {
      headers: {
        Authorization: `Token ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error fetching portfolios');
        }
        return res.json();
      })
      .then(setPortfolios)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  // ------------------------------------------------------------
  // 2) Create New Portfolio
  // ------------------------------------------------------------
  const handleCreatePortfolio = () => {
    const payload = {
      name: newPortfolioName,
      description: newPortfolioDescription,
      stocks: [],
    };

    fetch('http://127.0.0.1:8000/api/portfolios/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error creating portfolio');
        }
        return res.json();
      })
      .then(() => {
        alert('Portfolio created successfully!');
        setNewPortfolioName('');
        setNewPortfolioDescription('');
        fetchPortfolios();
      })
      .catch((err) => alert(err.message));
  };

  // ------------------------------------------------------------
  // 3) Edit Portfolio (Name & Description)
  // ------------------------------------------------------------
  const handleEditPortfolio = (portfolio) => {
    setEditPortfolioId(portfolio.id);
    setEditPortfolioName(portfolio.name);
    setEditPortfolioDescription(portfolio.description);
  };

  const handleSavePortfolio = () => {
    const payload = {
      name: editPortfolioName,
      description: editPortfolioDescription,
    };

    fetch(`http://127.0.0.1:8000/api/portfolios/${editPortfolioId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error updating portfolio');
        }
        return res.json();
      })
      .then(() => {
        alert('Portfolio updated successfully!');
        setEditPortfolioId(null);
        setEditPortfolioName('');
        setEditPortfolioDescription('');
        fetchPortfolios();
      })
      .catch((err) => alert(err.message));
  };

  const handleCancelEdit = () => {
    setEditPortfolioId(null);
    setEditPortfolioName('');
    setEditPortfolioDescription('');
  };

  // ------------------------------------------------------------
  // 4) Delete Portfolio
  // ------------------------------------------------------------
  const handleDeletePortfolio = (portfolioId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this portfolio? This will remove all stocks in it.'
      )
    ) {
      return;
    }

    fetch(`http://127.0.0.1:8000/api/portfolios/${portfolioId}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error deleting portfolio');
        }
        alert('Portfolio deleted successfully!');
        fetchPortfolios();
      })
      .catch((err) => alert(err.message));
  };

  // ------------------------------------------------------------
  // 5) Handling Search & Adding Stocks
  // ------------------------------------------------------------
  const handleSearchChange = (portfolioId, query) => {
    setSearchQuery((prev) => ({ ...prev, [portfolioId]: query }));

    if (query.length > 1) {
      fetch(`http://127.0.0.1:8000/api/stocks/?search=${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Error searching stocks');
          }
          return res.json();
        })
        .then((data) =>
          setSearchResults((prev) => ({ ...prev, [portfolioId]: data }))
        )
        .catch(console.error);
    } else {
      setSearchResults((prev) => ({ ...prev, [portfolioId]: [] }));
    }
  };

  // Show the form for adding stock (buy_price & shares)
  const handleAddStockClick = (portfolioId, stockId) => {
    const currentPortfolio = portfolios.find((p) => p.id === portfolioId);
    if (
      currentPortfolio &&
      currentPortfolio.stocks &&
      currentPortfolio.stocks.some((s) => s.id === stockId)
    ) {
      alert('This stock is already added in the portfolio.');
      return;
    }
    setAddingStock({ portfolioId, stockId });
    setFormValues({ buy_price: '', shares: '' });
  };

  // Update form fields (buy_price & shares)
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Submit to /api/portfolios/{portfolioId}/{stockId}/ for adding a stock
  const handleSubmitAddStock = () => {
    const { portfolioId, stockId } = addingStock;
    const payload = {
      buy_price: parseFloat(formValues.buy_price),
      shares: parseInt(formValues.shares),
    };

    fetch(`http://127.0.0.1:8000/api/portfolios/${portfolioId}/${stockId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || 'Error adding stock');
        }
        return res.json();
      })
      .then(() => {
        alert('Stock added to portfolio!');
        setAddingStock(null);
        setFormValues({ buy_price: '', shares: '' });
        fetchPortfolios();
      })
      .catch((err) => alert(err.message));
  };

  // ------------------------------------------------------------
  // 6) Delete Stock
  // ------------------------------------------------------------
  const handleDeleteStock = (portfolioId, index) => {
    fetch(`http://127.0.0.1:8000/api/portfolios/${portfolioId}/${index + 1}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error deleting stock');
        }
        alert('Stock removed from portfolio.');
        fetchPortfolios();
      })
      .catch((err) => alert(err.message));
  };

  // ------------------------------------------------------------
  // Calculate Overall Portfolio Profit (for single portfolios)
  // ------------------------------------------------------------
  const calculatePortfolioProfit = (stocks) => {
    const totalCost = stocks.reduce((acc, stock) => {
      const cost = parseFloat(stock.buy_price) * parseFloat(stock.shares);
      return acc + cost;
    }, 0);

    const totalCurrent = stocks.reduce((acc, stock) => {
      const currentPrice = stock.current_close
        ? parseFloat(stock.current_close)
        : parseFloat(stock.buy_price);
      const currValue = currentPrice * parseFloat(stock.shares);
      return acc + currValue;
    }, 0);

    return totalCost > 0 ? ((totalCurrent - totalCost) / totalCost) * 100 : 0;
  };

  // ------------------------------------------------------------
  // Calculate Total Profit/Loss Over All Portfolios
  // ------------------------------------------------------------
  const calculateOverallProfit = () => {
    let totalCostAll = 0;
    let totalCurrentAll = 0;
    portfolios.forEach((portfolio) => {
      portfolio.stocks?.forEach((stock) => {
        totalCostAll += parseFloat(stock.buy_price) * parseFloat(stock.shares);
        const currentPrice = stock.current_close
          ? parseFloat(stock.current_close)
          : parseFloat(stock.buy_price);
        totalCurrentAll += currentPrice * parseFloat(stock.shares);
      });
    });
    return totalCostAll > 0 ? ((totalCurrentAll - totalCostAll) / totalCostAll) * 100 : 0;
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  const overallProfit = calculateOverallProfit();
  // Determine overall status text and formatting
  const overallStatus = overallProfit >= 0 ? 'Profit' : 'Loss';
  const displayProfit = Math.abs(overallProfit).toFixed(2);
  const overallProfitColor = overallProfit >= 0 ? 'green' : 'red';

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>My Portfolios</h2>
      <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.2rem', color: overallProfitColor }}>
        Overall {overallStatus}: {displayProfit}%
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* CREATE NEW PORTFOLIO FORM */}
      <div
        style={{
          border: '1px solid #ddd',
          padding: '15px',
          borderRadius: '12px',
          marginBottom: '30px',
          backgroundColor: '#fafafa',
        }}
      >
        <h3>Create a New Portfolio</h3>
        <input
          type="text"
          placeholder="Portfolio Name"
          value={newPortfolioName}
          onChange={(e) => setNewPortfolioName(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Portfolio Description"
          value={newPortfolioDescription}
          onChange={(e) => setNewPortfolioDescription(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleCreatePortfolio}>Create Portfolio</button>
      </div>

      {/* DISPLAY ALL PORTFOLIOS */}
      {portfolios.map((portfolio) => {
        const isEditing = editPortfolioId === portfolio.id;
        const portfolioProfitPercent = calculatePortfolioProfit(portfolio.stocks || []);
        const portfolioProfitColor = portfolioProfitPercent >= 0 ? 'green' : 'red';
        const portfolioStatus = portfolioProfitPercent >= 0 ? 'Up' : 'Down';

        return (
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
            {/* Portfolio header with overall profit info */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editPortfolioName}
                    onChange={(e) => setEditPortfolioName(e.target.value)}
                    style={{ marginRight: '10px', marginBottom: '10px' }}
                  />
                  <input
                    type="text"
                    value={editPortfolioDescription}
                    onChange={(e) => setEditPortfolioDescription(e.target.value)}
                    style={{ marginRight: '10px', marginBottom: '10px' }}
                  />
                  <button onClick={handleSavePortfolio} style={{ marginRight: '10px' }}>
                    Save
                  </button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <div>
                    <h3>{portfolio.name}</h3>
                    <p>{portfolio.description}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: portfolioProfitColor, fontWeight: 'bold' }}>
                      Overall: {portfolioProfitPercent.toFixed(2)}% {portfolioStatus}
                    </p>
                    <button onClick={() => handleEditPortfolio(portfolio)} style={{ marginRight: '10px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeletePortfolio(portfolio.id)} style={{ color: 'red' }}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Search bar for adding stocks */}
            <div style={{ marginTop: '15px' }}>
              <input
                type="text"
                placeholder="Search stock to add..."
                value={searchQuery[portfolio.id] || ''}
                onChange={(e) => handleSearchChange(portfolio.id, e.target.value)}
                style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
              />
            </div>

            {/* Display search results */}
            {searchResults[portfolio.id]?.length > 0 && (
              <div>
                <h5>Search Results</h5>
                {searchResults[portfolio.id].map((stock) => {
                  const alreadyAdded = portfolio.stocks?.some((s) => s.id === stock.id);
                  return (
                    <div key={stock.id} style={{ marginBottom: '5px' }}>
                      {stock.ticker}{' '}
                      {alreadyAdded ? (
                        <span style={{ color: 'gray', fontStyle: 'italic' }}>Already Added</span>
                      ) : (
                        <button onClick={() => handleAddStockClick(portfolio.id, stock.id)}>
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Form for entering buy_price & shares (visible when adding a stock) */}
            {addingStock && addingStock.portfolioId === portfolio.id && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="number"
                  name="buy_price"
                  placeholder="Buy Price"
                  value={formValues.buy_price}
                  onChange={handleFormChange}
                  style={{ marginRight: '10px' }}
                />
                <input
                  type="number"
                  name="shares"
                  placeholder="Shares"
                  value={formValues.shares}
                  onChange={handleFormChange}
                  style={{ marginRight: '10px' }}
                />
                <button onClick={handleSubmitAddStock}>Submit</button>
              </div>
            )}

            {/* Display portfolio stocks as cards */}
            <h4>Stocks</h4>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {portfolio.stocks?.map((stock, index) => {
                const buyPrice = parseFloat(stock.buy_price);
                const currentPrice = stock.current_close
                  ? parseFloat(stock.current_close)
                  : buyPrice;
                const profitPercent = buyPrice > 0 ? ((currentPrice - buyPrice) / buyPrice) * 100 : 0;
                const profitColor = profitPercent >= 0 ? 'green' : 'red';

                return (
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
                    <strong>
                      <Link
                        to={`/stocks/${stock.id}`}
                        style={{ textDecoration: 'none', color: '#1a73e8' }}
                      >
                        {stock.ticker}
                      </Link>
                    </strong>
                    <p>Buy Price: {stock.buy_price}</p>
                    <p>Shares: {stock.shares}</p>
                    <p style={{ color: profitColor }}>
                      Profit: {profitPercent.toFixed(2)}%
                    </p>
                    <button
                      onClick={() => handleDeleteStock(portfolio.id, index)}
                      style={{ color: 'red' }}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Portfolio;