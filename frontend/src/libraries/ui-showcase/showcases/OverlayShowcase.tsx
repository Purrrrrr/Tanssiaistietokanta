import { useState } from 'react'

import { showcase } from '../types'

import { Alert, Button, Dialog } from 'libraries/ui'

function OverlayShowcase() {
  const [modal, setModal] = useState<'alert' | 'dialog' | null>(null)
  return <div>
    <Button text="Open alert" onClick={() => setModal('alert')} />
    <Button text="Open dialog" onClick={() => setModal('dialog')} />
    <Dialog
      className="max-w-100"
      onClose={() => setModal(null)}
      isOpen={modal === 'dialog'}
      title="This is a dialog"
      closeButtonLabel="close dialog"
    >
      <Dialog.Body>
        <Lorem />
      </Dialog.Body>
      <Dialog.Footer>
        A footer
        <Button text="Some action" onClick={() => setModal(null)} />
      </Dialog.Footer>
    </Dialog>
    <Alert
      onClose={() => setModal(null)}
      isOpen={modal === 'alert'}
      title="This is an alert"
      buttons={[
        {
          text: 'Ok',
          color: 'danger',
        },
        'Cancel',
      ]}
    >
      <p>Some children go here</p>
    </Alert>
  </div>
}

function Lorem() {
  return <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  </p>
}

OverlayShowcase.showCase = showcase({
  title: 'Overlays',
  props: {},
  render: () => <OverlayShowcase />,
})

export { OverlayShowcase }
