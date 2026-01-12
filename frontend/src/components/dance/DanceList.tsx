import { useState } from 'react'

import { DanceListItem } from 'types'
import { ID } from 'backend/types'

import { useDance } from 'services/dances'

import { Button, ColorClass, ItemList, type Sort } from 'libraries/ui'
import { ChevronDown, ChevronUp, Edit } from 'libraries/ui/icons'
import { InfiniteItemLoader } from 'components/InfiniteItemLoader'
import { ColoredTag } from 'components/widgets/ColoredTag'
import { useT, useTranslation } from 'i18n'
import { sortedBy } from 'utils/sorted'

import { PlainDanceEditor } from './DanceEditor'
import { DanceIsUsedIn } from './DanceIsUsedIn'
import { DanceLink } from './DanceLink'
import { DeleteDanceButton } from './DeleteDanceButton'

interface DanceListProps {
  dances: DanceListItem[]
}

export function DanceList({ dances: unsortedDances }: DanceListProps) {
  const t = useT('pages.dances.danceList')
  const [sort, setSort] = useState<Sort>({ key: 'name', direction: 'asc' })
  const dances = sortedBy(unsortedDances, danceSorter(sort.key), sort.direction === 'desc')

  return <div className="mt-6">
    {dances.length > 0 &&
      <p className="my-3">{t('showingNDances', { count: dances.length })}</p>
    }
    <InfiniteItemLoader items={dances}>
      {dances =>
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
          {dances.map((dance: DanceListItem) => <DanceListRow key={dance._id} dance={dance} />) }
        </ItemList>
      }
    </InfiniteItemLoader>
  </div>
}

function danceSorter(key: string) {
  switch (key) {
    default:
    case 'name':
      return (dance: DanceListItem) => dance.name
    case 'category':
      return (dance: DanceListItem) => dance.category?.trim() === '' ? null : dance.category
    case 'popularity':
      return (dance: DanceListItem) => dance.events.length + (dance.wikipageName ? 0.5 : 0)
  }
}

function DanceListRow({ dance }: { dance: DanceListItem }) {
  const t = useT('pages.dances.danceList')
  const [showEditor, setShowEditor] = useState(false)

  return <ItemList.Row
    expandableContent={<DanceListRowEditor danceId={dance._id} />}
    expandableContentLoadingMessage={t('loadingEditor')}
    isOpen={showEditor}
  >
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
        requireRight="dances:modify"
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

function DanceListRowEditor({ danceId }: { danceId: ID }) {
  const result = useDance({ id: danceId })
  if (!result.data?.dance) return null

  return <PlainDanceEditor dance={result.data.dance} />
}
