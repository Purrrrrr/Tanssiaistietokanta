import { DanceListItem, ID } from 'types'

import { useDance } from 'services/dances'

import { ItemList2 } from 'libraries/ui'
import { ColorClass } from 'libraries/ui/classes'
import { Edit } from 'libraries/ui/icons'
import { DanceCategoryTag } from 'components/dance/DanceCategoryTag'
import { DanceEditor } from 'components/dance/DanceEditor'
import { InfiniteItemLoader } from 'components/InfiniteItemLoader'
import { useT, useTranslation } from 'i18n'

import { DanceIsUsedIn } from './DanceIsUsedIn'
import { DeleteDanceButton } from './DeleteDanceButton'

interface DanceListProps {
  dances: DanceListItem[]
}

export function DanceList({ dances }: DanceListProps) {
  const t = useT('routes.dances.list')
  const label = useT('domain.dance')
  const editStr = useTranslation('common.edit')
  const loadingStr = useTranslation('common.loadingEditor')

  return <div>
    {dances.length > 0 &&
      <p>{t('showingNDances', { count: dances.length })}</p>
    }
    <InfiniteItemLoader items={dances}>
      {dances =>
        <ItemList2
          items={dances}
          emptyText={t('noDances')}
          labelTranslator={label}
          wrapType="grid"
          rowClassName="wrapped:grid-cols-[1fr_max-content_max-content] wrapped:grid-rows-2 wrapped:grid-flow-col"
          columns={[
            {
              key: 'name',
              width: '1fr',
              className: 'wrapped:font-bold wrapped:text-lg wrapped:p-2 text-ellipsis basis-0 grow',
              link: dance => ({ to: '/dances/$danceId', params: { danceId: dance._id } }),
              isRowLink: true,
            }, {
              key: 'category',
              width: 'minmax(min(300px,30%), max-content)',
              className: 'self-start mt-3',
              wrappedBreakAfter: true,
              sortBy: dance => dance.category?.trim() === '' ? null : dance.category,
              content: dance => dance.category
                ? <DanceCategoryTag title={dance.category} />
                : <span className={ColorClass.textMuted}>{t('noCategory')}</span>,
            }, {
              key: 'danceUsage',
              width: 'max-content',
              className: 'grow wrapped:text-right :not:wrapped:-me-4',
              link: null,
              sortBy: (dance: DanceListItem) => [dance.events.length, !!dance.wikipageName],
              content: dance => <DanceIsUsedIn minimal events={dance.events} wikipageName={dance.wikipageName} />,
            },
          ]}
          actions={dance => <DeleteDanceButton minimal dance={dance} />}
          actionsColumnClassName="wrapped:text-right"
          expandableContent={dance => <DanceListRowEditor danceId={dance._id} />}
          expandButtonProps={dance => ({
            icon: <Edit />,
            color: 'primary',
            requireRight: 'dances:modify',
            entityId: dance._id,
            'aria-label': editStr,
            tooltip: editStr,
          })}
          expandableContentLoadingMessage={loadingStr}
        />
      }
    </InfiniteItemLoader>
  </div>
}

function DanceListRowEditor({ danceId }: { danceId: ID }) {
  const result = useDance({ id: danceId })
  if (!result.data?.dance) return null

  return <DanceEditor dance={result.data.dance} className="p-2 border-gray-200 border-t" />
}
