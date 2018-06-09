import { put } from 'redux-saga/effects';
import actions from '../actions/main-page';

export function* putVoiceMemo(soundSource) {
  yield put(actions.putVoiceMemo(soundSource));
}

export default [

];
