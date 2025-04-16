import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../../actions/auth';

const navbarStyle = {
  position: 'fixed',
  top: 0,
  width: '100%',
  height: '60px',
  backgroundColor: '#1a73e8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  color: '#fff',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
};

const navLinkStyle = {
  color: '#fff',
  textDecoration: 'none',
  marginRight: '15px',
  fontSize: '1rem',
};

const welcomeTextStyle = {
  marginRight: '15px',
  fontSize: '1rem',
  fontWeight: 'bold',
};

const logoutButtonStyle = {
  backgroundColor: '#ff4d4d',
  border: 'none',
  color: '#fff',
  padding: '5px 10px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '1rem',
};

export class Header extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
  };

  render() {
    const { isAuthenticated, user } = this.props.auth;

    return (
      <header style={navbarStyle}>
        <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Stock Portal</div>
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated && (
            <>
              <span style={welcomeTextStyle}>
                Welcome, {user ? user.username : 'User'}
              </span>
              <Link to="/stocks" style={navLinkStyle}>
                Home
              </Link>
            </>
          )}
          <Link to="/about" style={navLinkStyle}>
            About
          </Link>
          {isAuthenticated ? (
            <button onClick={this.props.logout} style={logoutButtonStyle}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/register" style={navLinkStyle}>
                Register
              </Link>
              <Link to="/login" style={navLinkStyle}>
                Login
              </Link>
            </>
          )}
        </nav>
      </header>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logout })(Header);