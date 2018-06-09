export const actionsNames = {
  PUT_VOICE_MEMO: 'PUT_VOICE_MEMO',
  PLAY_VOICE_MEMO: 'PLAY_VOICE_MEMO',
  STOP_VOICE_MEMO: 'STOP_VOICE_MEMO',
  DELETE_VOICE_MEMO: 'DELETE_VOICE_MEMO',
};

export default {
  playVoiceMemo(voiceMemo) {
    return {
      type: actionsNames.PLAY_VOICE_MEMO,
      voiceMemo,
    };
  },
  stopVoiceMemo(voiceMemo) {
    return {
      type: actionsNames.STOP_VOICE_MEMO,
      voiceMemo,
    };
  },
  putVoiceMemo(voiceMemo) {
    return {
      type: actionsNames.PUT_VOICE_MEMO,
      voiceMemo,
    };
  },
  deleteVoiceMemo(voiceMemo) {
    return {
      type: actionsNames.DELETE_VOICE_MEMO,
      voiceMemo,
    };
  },
};
