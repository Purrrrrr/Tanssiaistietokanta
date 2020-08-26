import React from "react";
import {toMinSec, prefixZero} from "utils/duration";

export function Duration({value}) {
  if (!value) return <>0:00</>;
  const [minutes, seconds] = toMinSec(value);
  return <>{minutes+":"+prefixZero(seconds)}</>
}
