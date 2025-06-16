import FormUiShowcase from 'libraries/formsV2/UiShowcase'
import { Button, RegularLink, Tab, Tabs } from 'libraries/ui'

import { Showcase } from './Showcase'
import { titleCase } from './utils/titleCase'

const colors = ['none', 'primary', 'success', 'danger', 'warning'] as const

export default function UiShowcase() {
  return <section>
    <section className="">
      <h1>UI Showcase</h1>

      <RegularLink href="#">
        Link
      </RegularLink>

      <Showcase
        title="Button"
        propDefs={{
          disabled: { type: 'boolean' },
          icon: { type: 'boolean', default: true },
        }}
      >
        {({ disabled, icon }) =>
          <div className="flex gap-2">
            {colors.map(color =>
              <Button key={color} intent={color} icon={icon ? 'trash' : undefined} disabled={disabled as boolean} >{titleCase(color)}</Button>
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
    </section>

    <FormUiShowcase />
  </section>
}
