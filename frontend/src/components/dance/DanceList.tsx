import { useState } from 'react'
import { ChevronDown, ChevronUp, Edit } from '@blueprintjs/icons'

import { DanceWithEvents } from 'types'

import { Button, Card, ColorClass, ItemList, type Sort } from 'libraries/ui'
import { InfiniteItemLoader } from 'components/InfiniteItemLoader'
import { ColoredTag } from 'components/widgets/ColoredTag'
import { useT, useTranslation } from 'i18n'

import { DanceEditor, PlainDanceEditor } from './DanceEditor'
import { DanceIsUsedIn } from './DanceIsUsedIn'
import { DanceLink } from './DanceLink'
import { DeleteDanceButton } from './DeleteDanceButton'

interface DanceListProps {
  dances: DanceWithEvents[]
  view?: View
  sort: Sort
  onSort: (sort: Sort) => void
}
export type View = 'tight' | 'extended'

export function DanceList({ dances, view, sort, onSort }: DanceListProps) {
  const t = useT('pages.dances.danceList')

  return <div className="mt-6">
    {dances.length > 0 &&
      <p className="my-3">{t('showingNDances', { count: dances.length })}</p>
    }
    <InfiniteItemLoader items={dances}>
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
            <ItemList.Header paddingClass="">
              <ItemList.SortButton sortKey="name" currentSort={sort} onSort={onSort}>{t('name')}</ItemList.SortButton>
              <ItemList.SortButton sortKey="category" currentSort={sort} onSort={onSort}>{t('category')}</ItemList.SortButton>
              <ItemList.SortButton sortKey="popularity" currentSort={sort} onSort={onSort}>{t('danceUsage')}</ItemList.SortButton>
            </ItemList.Header>
            {dances.map((dance: DanceWithEvents) => <DanceListRow key={dance._id} dance={dance} />) }
          </ItemList>
        )
      }
    </InfiniteItemLoader>
  </div>
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
      <Button
        minimal
        icon={<Edit />}
        aria-label={useTranslation('common.edit')}
        tooltip={useTranslation('common.edit')}
        color="primary"
        onClick={() => setShowEditor(!showEditor)}
        rightIcon={showEditor ? <ChevronUp /> : <ChevronDown />}
      />
    </div>
  </ItemList.Row>
}

function ExtendedDanceListRow({ dance }: { dance: DanceWithEvents }) {
  return <Card>
    <DanceEditor dance={dance} showLink />
  </Card>
}
