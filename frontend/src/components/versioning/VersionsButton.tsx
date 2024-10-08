import React, { useState } from 'react'

import {Button} from 'libraries/ui'

import VersionChooser from './VersionChooser'

interface VersionsButtonProps extends React.ComponentProps<typeof VersionChooser> {
  entityType: 'event'
}

export function VersionsButton(props: VersionsButtonProps) {
  const [show, setShow] = useState(true)
  return <>
    <Button icon="history" minimal style={{float: 'right'}} onClick={() => setShow(!show)}>Muokkaushistoria</Button>
    {show && <VersionChooser {...props} />}
  </>

}
