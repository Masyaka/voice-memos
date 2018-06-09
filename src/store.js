import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { routerReducer } from 'react-router-redux';
import logger from 'redux-logger';

import reducers from './reducers';
import sagas from './sagas';

// create the saga middleware
const sagaMiddleware = createSagaMiddleware();
// mount it on the Store
const store = createStore(
  combineReducers({
    ...reducers,
    routing: routerReducer,
  }),
  applyMiddleware(sagaMiddleware),
  applyMiddleware(logger),
);

// then run the saga
sagaMiddleware.run(sagas);

export default store;
