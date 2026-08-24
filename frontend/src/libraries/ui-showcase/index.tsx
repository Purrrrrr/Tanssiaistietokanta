import { useState } from 'react'

import { type Showcase } from './types'

import { MenuLink, MenuSection, Page } from 'components/Page'

import { ShowcaseContainer } from './ShowcaseContainer'
import { anchorButtonShowcase } from './showcases/AnchorButtonShowcase'
import { autosizedSectionShowcase } from './showcases/AutosizedSectionShowcase'
import { BreadcrumbsShowcase } from './showcases/BreadcrumbsShowcase'
import { buttonShowcase } from './showcases/ButtonShowcase'
import { calloutShowcase } from './showcases/CalloutShowcase'
import { collapseShowcase } from './showcases/CollapseShowcase'
import { FabricShowcase } from './showcases/FabricShowcase'
import { FormsShowcase } from './showcases/FormsShowcase'
import { globalSpinnerShowcase } from './showcases/GlobalSpinnerShowcase'
import { ItemListShowcase } from './showcases/ItemListShowcase'
import { EditorShowcase } from './showcases/LexicalShowcase'
import { LinkShowcase } from './showcases/LinkShowcase'
import { OverlayShowcase } from './showcases/OverlayShowcase'
import { SwitchShowcase } from './showcases/SwitchShowcase'
import { tabsShowcase } from './showcases/TabsShowcase'
import { TagShowcase } from './showcases/TagShowcase'
import { toastsShowcase } from './showcases/ToastsShowcase'

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
  ItemListShowcase.showCase,
  FabricShowcase.showCase,
  EditorShowcase.showCase,
  LinkShowcase.showCase,
  toastsShowcase,
  FormsShowcase.showCase,
  buttonShowcase,
  SwitchShowcase.showCase,
  autosizedSectionShowcase,
  calloutShowcase,
  tabsShowcase,
  TagShowcase.showCase,
  OverlayShowcase.showCase,
  collapseShowcase,
  globalSpinnerShowcase,
  anchorButtonShowcase,
  BreadcrumbsShowcase.showCase,
]
