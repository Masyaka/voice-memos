export function padWithZero(value) {
  return value > 9 ? value : '0' + value;
}

/**
 * @param time {number} time in seconds
 * @returns {string} ime string in HH:ss format
 */
export function secondsToTimeString(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return padWithZero(minutes) + ':' + padWithZero(seconds);
}
