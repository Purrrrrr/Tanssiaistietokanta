import FormUiShowcase from 'libraries/formsV2/UiShowcase'
import { AutosizedSection, Button, RegularLink, showToast, Tab, Tabs } from 'libraries/ui'

import { Showcase } from './Showcase'
import { titleCase } from './utils/titleCase'

const colors = ['none', 'primary', 'success', 'danger', 'warning'] as const

export default function UiShowcase() {
  return <section>
    <section className="">
      <h1>UI Showcase</h1>

      <div className="flex gap-2">
        {colors.map(color =>
          <Button key={color} color={color} onClick={() => showToast({ message: 'This is toast', intent: color })}>Show toast</Button>
        )}
      </div>

      <RegularLink href="#">
        Link
      </RegularLink>

      <Showcase
        title="Button"
        propDefs={{
          disabled: { type: 'boolean' },
          minimal: { type: 'boolean' },
          icon: { type: 'boolean', default: true },
        }}
      >
        {({ disabled, icon, minimal }) =>
          <div className="flex gap-2">
            {colors.map(color =>
              <Button key={color} color={color} minimal={minimal as boolean} icon={icon ? 'trash' : undefined} disabled={disabled as boolean} >{titleCase(color)}</Button>
            )}
          </div>
        }
      </Showcase>
      <Showcase
        title="Tabs"
        propDefs={{
        }}
      >
        {() =>
          <Tabs defaultSelectedTabId="tab2">
            <Tab id="tab1" title="Tab1" panel={<p>Panel 1</p>} />
            <Tab id="tab2" title="Tab2" panel={<p>Panel 2</p>} />
            <Tab id="tab3" title="Tab3" panel={<p>Panel 3</p>} />
          </Tabs>
        }
      </Showcase>
      <Showcase
        title="Autosized section"
        propDefs={{
          lines: {
            type: 'number',
            default: 1,
            min: 0,
          },
          cols: {
            type: 'number',
            default: 1,
            min: 0,
          },
        }}
      >
        {({ cols, lines }) =>
          <AutosizedSection className="bg-gray-200 size-50">
            <div className="flex">
              {Array(cols).fill(0).map((_, i) =>
                <div key={i}>
                  {Array(lines).fill(0).map((_, i) => <p key={i}>Lorem ipsum lorem ipsum</p>)}

                </div>
              )}
            </div>
          </AutosizedSection>
        }
      </Showcase>
    </section>

    <FormUiShowcase />
  </section>
}
