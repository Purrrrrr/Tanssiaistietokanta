export function toMinSec(value) {
  const seconds = value%60;
  const minutes = Math.floor(value/60);
  return [minutes, seconds];
}

export function toSeconds(minutes, seconds) {
  return Math.max(seconds+(minutes*60), 0);
}

export const prefixZero = (value) => (value < 10 ? "0" : "") + value.toFixed()
