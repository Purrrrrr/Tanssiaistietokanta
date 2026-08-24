import { showcase } from '../types'

import { Tab, Tabs } from 'libraries/ui'

export const tabsShowcase = showcase({
  title: 'Tabs',
  props: { },
  render: () =>
    <Tabs defaultSelectedTabId="tab2">
      <Tab id="tab1" title="Tab1" panel={<p>Panel 1</p>} />
      <Tab id="tab2" title="Tab2" panel={<p>Panel 2</p>} />
      <Tab id="tab3" title="Tab3" panel={<p>Panel 3</p>} />
    </Tabs>,
})
