import {toMinSec, prefixZero} from "utils/duration";

export function Duration({value}) {
  const [minutes, seconds] = toMinSec(value);
  return minutes+":"+prefixZero(seconds);
}
