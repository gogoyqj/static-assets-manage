/* eslint-disable no-constant-condition */
import { delay, effects } from 'redux-saga';

const { put, takeEvery } = effects;

export function *incrementAsync() {
  yield delay(1000);
  yield put({type: 'INCREMENT'});
}

export default function *rootSaga() {
  yield takeEvery('INCREMENT_ASYNC', incrementAsync);
}
