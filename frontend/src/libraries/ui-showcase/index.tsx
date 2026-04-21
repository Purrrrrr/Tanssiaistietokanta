import { useEffect, useState } from 'react'

import { booleanProp, numberProp, type Showcase, showcase } from './types'

import { Switch } from 'libraries/forms'
import FormUiShowcase from 'libraries/formsV2/UiShowcase'
import { DocumentViewer, Editor, type MinifiedDocumentContent } from 'libraries/lexical'
import { Alert, Dialog } from 'libraries/overlays'
import { AnchorButton, AutosizedSection, Breadcrumb, BreadcrumbsContainer, Button, Callout, Collapse, GlobalSpinner, H2, RegularLink, showToast, Tab, Tabs } from 'libraries/ui'
import { Trash } from 'libraries/ui/icons'
import { MenuLink, MenuSection, Page } from 'components/Page'
import { ColoredTag, TAG_COLOR_COUNT } from 'components/widgets/ColoredTag'

import { ShowcaseContainer } from './ShowcaseContainer'
import { titleCase } from './utils/titleCase'

const colors = ['none', 'primary', 'success', 'danger', 'warning'] as const

export default function UiShowcase() {
  const [selectedShowcase, setSelectedShowcase] = useState(() => {
    const hash = decodeURIComponent(window.location.hash?.slice(1) ?? '')

    return showcases.find(scase => scase.title === hash) ?? showcases[0]
  })
  return <Page title="UI Showcase" menu={
    <MenuSection title="Available showcases">
      {showcases.map(scase =>
        <MenuLink
          key={scase.title}
          to="/ui-showcase"
          hash={scase.title}
          activeOptions={{
            includeHash: true,
          }}
          onClick={() => setSelectedShowcase(scase)} className={selectedShowcase === scase ? 'font-bold' : ''}
        >
          {scase.title}
        </MenuLink>,
      )}
    </MenuSection>
  }>
    <ShowcaseContainer {...selectedShowcase} />
  </Page>
}

const showcases: Showcase<Record<string, unknown>>[] = [
  showcase({
    title: 'Editor',
    props: {},
    render: () => <EditorShowcase />,
  }),
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
  showcase({
    title: 'Collapse',
    props: {
      isOpen: booleanProp(),
      keepChildrenMounted: booleanProp(),
    },
    render: ({ isOpen, keepChildrenMounted }) =>
      <Collapse isOpen={isOpen} keepChildrenMounted={keepChildrenMounted}>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </Collapse>,
  }),
  showcase({
    title: 'Global loading indicator',
    props: {
      loading: booleanProp(),
      timeout: booleanProp(),
    },
    render: ({ loading, timeout }) =>
      <GlobalSpinner
        loading={loading}
        timeout={timeout}
        loadingMessage="Loading..."
        connectionTimeoutMessage="Connection timed out"
      />,
  }),
  showcase({
    title: 'AnchorButton',
    props: {
      disabled: booleanProp(),
      minimal: booleanProp(),
      active: booleanProp(),
      icon: booleanProp({ default: true }),
    },
    render: ({ disabled, icon, minimal, active }) =>
      <div className="flex flex-wrap gap-2">
        {colors.map(color =>
          <AnchorButton key={color} href="#" color={color} minimal={minimal} icon={icon ? <Trash /> : undefined} active={active} aria-disabled={disabled}>{titleCase(color)}</AnchorButton>,
        )}
      </div>,
  }),
  showcase({
    title: 'Breadcrumbs',
    props: {},
    render: () => <BreadcrumbsShowcase />,
  }),
]

function EditorShowcase() {
  const [state, setState] = useState<MinifiedDocumentContent | null>(() => {
    const saved = window.localStorage.getItem('editorShowcaseState')
    return saved ? JSON.parse(saved) : null
  })
  useEffect(() => {
    window.localStorage.setItem('editorShowcaseState', JSON.stringify(state))
  }, [state])
  return (
    <div className="flex flex-col gap-4">
      <Editor value={state} imageUpload={{ owner: 'dances', owningId: 'fuu' }} onChange={setState} />
      <div className="p-2 rounded border-gray-400 border-dashed border-1">
        <p className="mb-2 text-xs text-gray-500">Document Viewer (read-only, no Lexical runtime)</p>
        <DocumentViewer document={state} />
      </div>
      <H2>Minified state ({JSON.stringify(state).length} bytes)</H2>
      <pre className="overflow-auto p-2 bg-gray-100 rounded max-h-200"><code>{JSON.stringify(state, null, 2)}</code></pre>
      <H2>Another editor instance with the same state</H2>
      <Editor value={state} imageUpload={{ owner: 'dances', owningId: 'fuu' }} onChange={setState} />
    </div>
  )
}

function range(count: number): number[] {
  console.log(Array(count).fill(0).map((_, index) => index))
  return Array(count).fill(0).map((_, index) => index)
}

function SwitchShowcase() {
  const [on, setOn] = useState(false)
  return <div className="grid grid-cols-2 grid-rows-2 grid-flow-row">
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

function BreadcrumbsShowcase() {
  return <BreadcrumbsContainer label="Example breadcrumbs">
    <Breadcrumb to="/" text="Home" />
    <Breadcrumb to="/dances" text="Dances" />
    <Breadcrumb to="/dances/$danceId" params={{ danceId: '1' }} text="Example dance" />
  </BreadcrumbsContainer>
}
