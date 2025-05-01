# Stock Market Dashboard

A full-stack web application that allows users to view historical stock data, create watchlists, and manage multiple portfolios. Built using Django for the backend and React with Redux for the frontend, the system supports secure user authentication and interactive data visualizations. While the project currently relies on static historical data, future versions aim to support real-time stock data via third-party APIs.

---

## Features

- **User Authentication**  
  Secure login and registration using token-based authentication (Knox).

- **Watchlist Management**  
  Users can add and track specific stocks of interest.

- **Portfolio Creation & Management**  
  Create multiple portfolios, track their performance, and manage holdings.

- **Historical Data Visualization**  
  Line charts and statistics for analyzing stock trends.

- **Responsive and Modular UI**  
  Built with React and Redux for state management.

- **Docker Support**  
  Dockerized backend and frontend for easy setup and deployment.

---

## Tech Stack

**Frontend**: React

**Backend**: Django, Django REST Framework 

**Containerization**: Docker, AWS

---

## Getting Started

### Prerequisites

- Python 3.x
- Node.js and npm
- Docker (optional, for containerized setup)

### Local Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/DeathlyMade/Stock-Market.git
   cd Stock-Market
   ```

2. **Backend Setup**
   ```bash
   cd StockMarket
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   npm install
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

### Docker Setup

To run both frontend and backend in containers:

```bash
docker compose up
```

---

## Project Structure

```
Stock-Market/
├── StockMarket/           # Django backend
├── .github/workflows/     # CI/CD configs
├── Dockerfile             # Backend container
├── Dockerfile-frontend    # Frontend container
├── docker-compose.yml
├── package.json           # React config
├── requirements.txt       # Python dependencies
├── webpack.config.js
└── Watchlist.png
```

---

## Future Work

- Real-time stock tracking using public APIs (e.g., Alpha Vantage, IEX Cloud)
- Alerts for stock movements or portfolio thresholds
- Enhanced portfolio analytics and performance charts
- Mobile-responsive improvements

