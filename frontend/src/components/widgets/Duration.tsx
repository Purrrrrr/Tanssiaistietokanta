import React from "react";
import {durationToString} from "utils/duration";

export function Duration({value}) {
  return <>{durationToString(value)}</>
}
