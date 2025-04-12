import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import { Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

import MainLayout from './layout/MainLayout';
import Dashboard from './leads/Dashboard';
import Alerts from './layout/Alerts';
import Login from './accounts/Login';
import Register from './accounts/Register';
import PrivateRoute from './common/PrivateRoute';

import { Provider } from 'react-redux';
import store from '../store';
import { loadUser } from '../actions/auth';
import StockList from './Stocks/StockList';
import StockDetail from './Stocks/StockDetail';
import Watchlist from './Stocks/Watchlist';
import Footer from './layout/Footer';

// Alert Options
const alertOptions = {
  timeout: 3000,
  position: 'top center',
};

class App extends Component {
  componentDidMount() {
    store.dispatch(loadUser());
  }

  // App.js
render() {
  return (
    <Provider store={store}>
      <AlertProvider template={AlertTemplate} {...alertOptions}>
        <Router>
          <Fragment>
            <Alerts />
            <MainLayout>
              <div className="container">
                <Switch>
                  <PrivateRoute exact path="/" component={Dashboard} />
                  <Route exact path="/stocks" component={StockList} />
                  <Route exact path="/stocks/:id" component={StockDetail} />
                  <Route exact path="/register" component={Register} />
                  <Route exact path="/login" component={Login} />
                  <Route exact path="/watchlist" component={Watchlist} />
                </Switch>
              </div>
            </MainLayout>
          </Fragment>
        </Router>
      </AlertProvider>
    </Provider>
  );
}
}

ReactDOM.render(<App />, document.getElementById('app'));
