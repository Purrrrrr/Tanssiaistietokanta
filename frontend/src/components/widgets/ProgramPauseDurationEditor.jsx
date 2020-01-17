import React from 'react';
import {NumericInput} from "@blueprintjs/core";

import {makeTranslate} from 'utils/translate';

const t = makeTranslate({
  pauseDuration: 'Tanssien välinen tauko',
  intervalDuration: 'Taukomusiikki',
  minutes: 'min.',
});

export function ProgramPauseDurationEditor({pause, setPause, intervalPause, setIntervalPause}) {
  return <>
    {t`pauseDuration`}{": "}
    <span style={{display: 'inline-block', width: "80px"}}>
      <NumericInput value={pause} onValueChange={setPause} fill />
    </span>
    {" "}{t`minutes`}{" "}
  {t`intervalDuration`}{": "}
    <span style={{display: 'inline-block', width: "80px"}}>
      <NumericInput value={intervalPause} onValueChange={setIntervalPause} fill />
    </span>
    {" "}{t`minutes`}
  </>;
}
