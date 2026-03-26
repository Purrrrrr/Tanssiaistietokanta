import { useState } from 'react'
import classNames from 'classnames'

import { DanceListItem, ID } from 'types'

import { useDance } from 'services/dances'

import { Button, ColorClass, ItemList, type Sort } from 'libraries/ui'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Edit } from 'libraries/ui/icons'
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
    <div className="">
      <DanceLink dance={dance} />
    </div>
    <div className="">
      {dance.category
        ? <ColoredTag title={dance.category} />
        : <span className={ColorClass.textMuted}>{t('noCategory')}</span>
      }
    </div>
    <Toolbar>
      <DanceIsUsedIn minimal events={dance.events} wikipageName={dance.wikipageName} />
      <DeleteDanceButton minimal dance={dance} />
      <Button
        requireRight="dances:modify"
        entityId={dance._id}
        minimal
        icon={<Edit />}
        aria-label={useTranslation('common.edit')}
        tooltip={useTranslation('common.edit')}
        color="primary"
        onClick={() => setShowEditor(!showEditor)}
        rightIcon={showEditor ? <ChevronUp /> : <ChevronDown />}
      />
    </Toolbar>
  </ItemList.Row>
}

function Toolbar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return <div className={classNames(
    'relative grow min-w-8 min-h-6 text-right',
  )}>
    <div className={classNames(
      'w-max max-xs:absolute inline-flex',
      !open && 'right-0 top-0',
      open && '-top-1 -right-1 max-xs:bg-white max-xs:rounded-md max-xs:p-1 max-xs:z-10 max-xs:shadow-md max-xs:shadow-stone-600/30',
    )}>
      <div className={classNames(
        !open && 'max-xs:hidden',
      )}>
        {children}
      </div>
      <Button
        className="xs:hidden"
        minimal
        icon={open ? <ChevronRight /> : <ChevronLeft />}
        title={useTranslation('common.actions')}
        onClick={() => setOpen(!open)}
      />
    </div>
  </div>
}

function DanceListRowEditor({ danceId }: { danceId: ID }) {
  const result = useDance({ id: danceId })
  if (!result.data?.dance) return null

  return <PlainDanceEditor dance={result.data.dance} />
}
