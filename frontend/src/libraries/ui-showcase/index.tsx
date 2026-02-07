import { useState } from 'react'

import { booleanProp, numberProp, type Showcase, showcase } from './types'

import { Switch } from 'libraries/forms'
import FormUiShowcase from 'libraries/formsV2/UiShowcase'
import { Alert, Dialog } from 'libraries/overlays'
import { AutosizedSection, Button, Callout, RegularLink, showToast, Tab, Tabs } from 'libraries/ui'
import { Trash } from 'libraries/ui/icons'
import { ColoredTag, TAG_COLOR_COUNT } from 'components/widgets/ColoredTag'

import { ShowcaseContainer } from './ShowcaseContainer'
import { titleCase } from './utils/titleCase'

const colors = ['none', 'primary', 'success', 'danger', 'warning'] as const

export default function UiShowcase() {
  const [selectedShowcase, setSelectedShowcase] = useState(() => {
    const hash = decodeURIComponent(window.location.hash?.slice(1) ?? '')

    return showcases.find(scase => scase.title === hash) ?? showcases[0]
  })
  return <section>
    <h1>UI Showcase</h1>

    <p className="flex flex-wrap gap-[0.7ch]">
      <span>Available showcases:</span>
      {showcases.map(scase =>
        <RegularLink key={scase.title} href={`#${scase.title}`} onClick={() => setSelectedShowcase(scase)}>{scase.title}</RegularLink>,
      )}
    </p>

    <ShowcaseContainer {...selectedShowcase} />

  </section>
}

const showcases: Showcase<Record<string, unknown>>[] = [
  showcase({
    title: 'Link',
    props: {},
    render: () => <RegularLink href="#">Link</RegularLink>,
  }),
  showcase({
    title: 'Toasts',
    props: {},
    render: () => <div className="flex gap-2">
      {colors.map(color =>
        <Button key={color} color={color} onClick={() => showToast({ message: 'This is toast', color })}>Show toast</Button>,
      )}
    </div>,
  }),
  showcase({
    title: 'Forms',
    props: {},
    render: () => <FormUiShowcase />,
  }),
  showcase({
    title: 'Button',
    props: {
      disabled: booleanProp(),
      minimal: booleanProp(),
      icon: booleanProp({ default: true }),
    },
    render: ({ disabled, icon, minimal }) =>
      <div className="flex gap-2">
        {colors.map(color =>
          <Button key={color} color={color} minimal={minimal} icon={icon ? <Trash /> : undefined} disabled={disabled}>{titleCase(color)}</Button>,
        )}
      </div>,
  }),
  showcase({
    title: 'Switch',
    props: {},
    render: () => <SwitchShowcase />,
  }),
  showcase({
    title: 'Autosized section',
    props: {
      lines: numberProp({ default: 1, min: 0 }),
      cols: numberProp({ default: 1, min: 0 }),
    },
    render: ({ cols, lines }) =>
      <AutosizedSection className="bg-gray-200 size-50">
        <div className="flex">
          {Array(cols).fill(0).map((_, i) =>
            <div key={i}>
              {Array(lines).fill(0).map((_, i) => <p key={i}>Lorem ipsum lorem ipsum</p>)}

            </div>,
          )}
        </div>
      </AutosizedSection>,
  }),
  showcase({
    title: 'Callout',
    props: {
      title: booleanProp({ default: true }),
    },
    render: ({ title }) =>
      <div className="flex flex-col gap-2">
        {colors.map(color =>
          <Callout key={color} color={color} title={title ? titleCase(color) : undefined}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Callout>,
        )}
      </div>,
  }),
  showcase({
    title: 'Tabs',
    props: { },
    render: () =>
      <Tabs defaultSelectedTabId="tab2">
        <Tab id="tab1" title="Tab1" panel={<p>Panel 1</p>} />
        <Tab id="tab2" title="Tab2" panel={<p>Panel 2</p>} />
        <Tab id="tab3" title="Tab3" panel={<p>Panel 3</p>} />
      </Tabs>,
  }),
  showcase({
    title: 'Colored tag',
    props: {
      small: booleanProp(),
      tag: booleanProp(),
    },
    render: ({ small, tag }) => range(TAG_COLOR_COUNT).map(color =>
      <ColoredTag small={small} tag={tag ? String(color) : undefined} key={color} title={`Tag color ${color}`} color={color} />,
    ),
  }),
  showcase({
    title: 'Overlays',
    props: {},
    render: () => <OverlayShowcase />,
  }),
]

function range(count: number): number[] {
  console.log(Array(count).fill(0).map((_, index) => index))
  return Array(count).fill(0).map((_, index) => index)
}

function SwitchShowcase() {
  const [on, setOn] = useState(false)
  return <div className="grid grid-flow-row grid-cols-2 grid-rows-2">
    <Switch id="demo-switch1" value={on} onChange={setOn} label="Switch" />
    <Switch id="demo-switch2" value={!on} onChange={(v) => setOn(!v)} label="Opposite switch" />
    <Switch id="demo-switch3" value={on} readOnly label="Readonly switch" onChange={() => {}} />
    <Switch id="demo-switch4" value={!on} readOnly label="Opposite readonly switch" onChange={() => {}} />
  </div>
}

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
