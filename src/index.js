import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import { syncHistoryWithStore } from 'react-router-redux';
import { Router, Switch } from 'react-router-dom';
import './index.scss';
import 'babel-polyfill';
import store from './store';
import routes from './routes';
import Layout from './bundles/common/components/Layout';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const history = syncHistoryWithStore(createBrowserHistory(baseUrl), store);

render(
  <Provider store={ store }>
    <Layout>
      <Router history={history}>
        <Switch>
          {routes}
        </Switch>
      </Router>
    </Layout>
  </Provider>,
  document.getElementById('root'),
);
