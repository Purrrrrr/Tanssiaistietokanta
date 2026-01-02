import { useState } from 'react'
import { ChevronDown, ChevronUp, Edit } from '@blueprintjs/icons'

import { DanceWithEvents } from 'types'

import { Button, Card, ColorClass, ItemList, type Sort } from 'libraries/ui'
import { InfiniteItemLoader } from 'components/InfiniteItemLoader'
import { ColoredTag } from 'components/widgets/ColoredTag'
import { useT, useTranslation } from 'i18n'
import { sortedBy } from 'utils/sorted'

import { DanceEditor, PlainDanceEditor } from './DanceEditor'
import { DanceIsUsedIn } from './DanceIsUsedIn'
import { DanceLink } from './DanceLink'
import { DeleteDanceButton } from './DeleteDanceButton'
import { RequirePermissions } from 'components/rights/RequirePermissions'

interface DanceListProps {
  dances: DanceWithEvents[]
  view?: View
}
export type View = 'tight' | 'extended'

export function DanceList({ dances: unsortedDances, view }: DanceListProps) {
  const t = useT('pages.dances.danceList')
  const [sort, setSort] = useState<Sort>({ key: 'name', direction: 'asc' })
  const dances = sortedBy(unsortedDances, danceSorter(sort.key), sort.direction === 'desc')

  return <div className="mt-6">
    {dances.length > 0 &&
      <p className="my-3">{t('showingNDances', { count: dances.length })}</p>
    }
    <InfiniteItemLoader key={view} items={dances}>
      {dances => view === 'extended'
        ? (
          <>
            {dances.map((dance: DanceWithEvents) => <ExtendedDanceListRow dance={dance} key={dance._id} />)}
            {dances.length > 0 || <p>{t('noDances')}</p>}
          </>
        )
        : (
          <ItemList
            items={dances}
            emptyText={t('noDances')}
            columns="grid-cols-[1fr_minmax(min(300px,30%),max-content)_max-content]"
          >
            <ItemList.SortableHeader currentSort={sort} onSort={setSort} columns={[
              { key: 'name', label: t('name') },
              { key: 'category', label: t('category') },
              { key: 'popularity', label: t('danceUsage') },
            ]} />
            {dances.map((dance: DanceWithEvents) => <DanceListRow key={dance._id} dance={dance} />) }
          </ItemList>
        )
      }
    </InfiniteItemLoader>
  </div>
}

function danceSorter(key: string) {
  switch (key) {
    default:
    case 'name':
      return (dance: DanceWithEvents) => dance.name
    case 'category':
      return (dance: DanceWithEvents) => dance.category?.trim() === '' ? null : dance.category
    case 'popularity':
      return (dance: DanceWithEvents) => dance.events.length + (dance.wikipageName ? 0.5 : 0)
  }
}

function DanceListRow({ dance }: { dance: DanceWithEvents }) {
  const t = useT('pages.dances.danceList')
  const [showEditor, setShowEditor] = useState(false)

  return <ItemList.Row expandableContent={<PlainDanceEditor dance={dance} />} isOpen={showEditor}>
    <div className="max-md:basis-35 grow">
      <DanceLink dance={dance} />
    </div>
    <div className="max-md:basis-35 grow">
      {dance.category
        ? <ColoredTag title={dance.category} />
        : <span className={ColorClass.textMuted}>{t('noCategory')}</span>
      }
    </div>
    <div className="text-right max-sm:w-full">
      <DanceIsUsedIn minimal events={dance.events} wikipageName={dance.wikipageName} />
      <DeleteDanceButton minimal dance={dance} />
      <RequirePermissions right="dances:modify">
        <Button
          minimal
          icon={<Edit />}
          aria-label={useTranslation('common.edit')}
          tooltip={useTranslation('common.edit')}
          color="primary"
          onClick={() => setShowEditor(!showEditor)}
          rightIcon={showEditor ? <ChevronUp /> : <ChevronDown />}
        />
      </RequirePermissions>
    </div>
  </ItemList.Row>
}

function ExtendedDanceListRow({ dance }: { dance: DanceWithEvents }) {
  return <Card>
    <DanceEditor dance={dance} showLink />
  </Card>
}
