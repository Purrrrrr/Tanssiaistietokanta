import { useState } from 'react'

import { type Showcase, booleanProp, numberProp, showcase } from './types'

import FormUiShowcase from 'libraries/formsV2/UiShowcase'
import { AutosizedSection, Button, Callout, RegularLink, showToast, Tab, Tabs } from 'libraries/ui'

import { ShowcaseContainer } from './ShowcaseContainer'
import { titleCase } from './utils/titleCase'

const colors = ['none', 'primary', 'success', 'danger', 'warning'] as const

export default function UiShowcase() {
  const [selectedShowcase, setSelectedShowcase] = useState(showcases[0])
  return <section>
    <h1>UI Showcase</h1>

    <p className="flex flex-wrap gap-[0.7ch]">
      <span>Available showcases:</span>
      {showcases.map(scase =>
        <RegularLink href={`#${scase.title}`} onClick={() => setSelectedShowcase(scase)}>{scase.title}</RegularLink>
      )}
    </p>

    <ShowcaseContainer {...selectedShowcase} />

  </section>
}

const showcases : Showcase<Record<string, unknown>>[] = [
  showcase({
    title: 'Link',
    props: {},
    render: () => <RegularLink href="#">Link</RegularLink>
  }),
  showcase({
    title: 'Toasts',
    props: {},
    render: () => <div className="flex gap-2">
      {colors.map(color =>
        <Button key={color} color={color} onClick={() => showToast({ message: 'This is toast', intent: color })}>Show toast</Button>
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
          <Button key={color} color={color} minimal={minimal} icon={icon ? 'trash' : undefined} disabled={disabled} >{titleCase(color)}</Button>
        )}
      </div>
  }),
  showcase({
    title: 'Autosized section',
    props:{
      lines: numberProp({ default: 1, min: 0 }),
      cols: numberProp({ default: 1, min: 0 }),
    },
    render: ({ cols, lines }) =>
      <AutosizedSection className="bg-gray-200 size-50">
        <div className="flex">
          {Array(cols).fill(0).map((_, i) =>
            <div key={i}>
              {Array(lines).fill(0).map((_, i) => <p key={i}>Lorem ipsum lorem ipsum</p>)}

            </div>
          )}
        </div>
      </AutosizedSection>
  }),
  showcase({
    title: 'Callout',
    props: {
      title: booleanProp({default: true})
    },
    render: ({ title }) =>
      <div className="flex flex-col gap-2">
        {colors.map(color =>
          <Callout key={color} intent={color} title={title ? titleCase(color) : undefined}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Callout>
        )}
      </div>
  }),
  showcase({
    title: 'Tabs',
    props: { },
    render: () =>
      <Tabs defaultSelectedTabId="tab2">
        <Tab id="tab1" title="Tab1" panel={<p>Panel 1</p>} />
        <Tab id="tab2" title="Tab2" panel={<p>Panel 2</p>} />
        <Tab id="tab3" title="Tab3" panel={<p>Panel 3</p>} />
      </Tabs>
  }),
]
