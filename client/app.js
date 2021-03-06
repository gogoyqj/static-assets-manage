/* eslint-disable no-unused-vars*/
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { sagaMonitor } from 'redux-saga';

import Home from './components/Home';
import reducer from './reducers';
import rootSaga from './sagas';


const sagaMiddleware = createSagaMiddleware({sagaMonitor});
const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleware)
);
sagaMiddleware.run(rootSaga);

const action = type => store.dispatch({type});

function render() {
  ReactDOM.render(
    <Home
      value={store.getState()}
      onIncrement={() => action('INCREMENT')}
      onDecrement={() => action('DECREMENT')}
      onIncrementIfOdd={() => action('INCREMENT_IF_ODD')}
      onIncrementAsync={() => action('INCREMENT_ASYNC')} />,
    document.getElementById('root')
  );
}

render();
store.subscribe(render);
