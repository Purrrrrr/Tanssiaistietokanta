import { DanceListItem, ID } from 'types'

import { useDance } from 'services/dances'

import { ItemList2 } from 'libraries/ui'
import { ColorClass } from 'libraries/ui/classes'
import { Edit } from 'libraries/ui/icons'
import { DanceEditor } from 'components/dance/DanceEditor'
import { InfiniteItemLoader } from 'components/InfiniteItemLoader'
import { ColoredTag } from 'components/widgets/ColoredTag'
import { useT, useTranslation } from 'i18n'

import { DanceIsUsedIn } from './DanceIsUsedIn'
import { DanceLink } from './DanceLink'
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
          columns={[
            {
              label: label('name'),
              width: '1fr',
              content: dance => <DanceLink dance={dance} />,
              sortBy: 'name',
            }, {
              label: label('category'),
              width: 'minmax(min(300px,30%), max-content)',
              sortBy: {
                name: 'category',
                value: dance => dance.category?.trim() === '' ? null : dance.category,
              },
              content: dance => dance.category
                ? <ColoredTag title={dance.category} />
                : <span className={ColorClass.textMuted}>{t('noCategory')}</span>,
            }, {
              label: label('danceUsage'),
              width: 'max-content',
              className: 'grow text-right -me-4',
              sortBy: {
                name: 'popularity',
                value: (dance: DanceListItem) => dance.events.length + (dance.wikipageName ? 0.5 : 0),
              },
              content: dance => <DanceIsUsedIn minimal events={dance.events} wikipageName={dance.wikipageName} />,
            },
          ]}
          actions={dance => <DeleteDanceButton minimal dance={dance} />}
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
