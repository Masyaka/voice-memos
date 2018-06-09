import { combineReducers } from 'redux';
import { actionsNames } from '../actions/main-page';

function voiceMemos(state = [], action) {
  switch (action.type) {
    case actionsNames.PUT_VOICE_MEMO:
      return [...state, action.voiceMemo];
    case actionsNames.DELETE_VOICE_MEMO:
      return state.filter(vm => vm !== action.voiceMemo);
    default:
      return state;
  }
}

function activeVoiceMemo(state = null, action) {
  switch (action.type) {
    case actionsNames.PLAY_VOICE_MEMO:
      return action.voiceMemo;
    case actionsNames.STOP_VOICE_MEMO:
      return null;
    default:
      return state;
  }
}

export default combineReducers({
  voiceMemos,
  activeVoiceMemo,
});
