import React from 'react'
import {NumericInput} from 'libraries/ui'

import {makeTranslate} from 'utils/translate'

const t = makeTranslate({
  pauseDuration: 'Tanssien välinen tauko',
  minutes: 'min.',
})

export function ProgramPauseDurationEditor({pause, setPause}) {
  return <>
    {t`pauseDuration`}{': '}
    <span style={{display: 'inline-block', width: '80px'}}>
      <NumericInput value={pause} onValueChange={setPause} fill />
    </span>
    {' '}{t`minutes`}{' '}
  </>
}
