import {useState} from 'react'
import { ChevronDown, ChevronUp, Edit } from '@blueprintjs/icons'

import { DanceWithEvents } from 'types'

import { Button, Card, ColorClass } from 'libraries/ui'
import ItemList from 'libraries/ui/ItemList'
import { InfiniteItemLoader } from 'components/InfiniteItemLoader'
import { ColoredTag } from 'components/widgets/ColoredTag'
import { useT, useTranslation } from 'i18n'

import {DanceEditor, PlainDanceEditor} from './DanceEditor'
import { DanceIsUsedIn } from './DanceIsUsedIn'
import { DanceLink } from './DanceLink'
import { DeleteDanceButton } from './DeleteDanceButton'

interface DanceListProps {
  dances: DanceWithEvents[]
  view?: View
}
export type View = 'tight' | 'extended'

export function DanceList({dances, view}: DanceListProps) {
  if (view === 'extended') {
    return <InfiniteItemLoader items={dances}>
      {dances => dances.map((dance : DanceWithEvents) => <ExtendedDanceListRow dance={dance} key={dance._id} />)}
    </InfiniteItemLoader>
  }

  return <InfiniteItemLoader items={dances}>
    {dances =>
      <ItemList>
        {dances.map((dance : DanceWithEvents) => <DanceListRow key={dance._id} dance={dance} />)}
      </ItemList>
    }
  </InfiniteItemLoader>
}

function DanceListRow({ dance }: { dance: DanceWithEvents }) {
  const t = useT('pages.dances.danceList')
  const [showEditor, setShowEditor] = useState(false)

  return <ItemList.Row expandableContent={<PlainDanceEditor dance={dance} />} isOpen={showEditor}>
    <div className="max-md:min-w-[max(160px,50%)]"><DanceLink dance={dance} /></div>
    <div className="max-md:min-w-[max(160px,50%)]">
      {dance.category
        ? <ColoredTag title={dance.category} />
        : <span className={ColorClass.textMuted}>{t('noCategory')}</span>
      }
    </div>
    <div className="max-sm:w-full text-right">
      <DanceIsUsedIn minimal events={dance.events} wikipageName={dance.wikipageName} />
      <DeleteDanceButton minimal dance={dance} />
      <Button
        minimal
        icon={<Edit />}
        aria-label={useTranslation('common.edit')}
        color="primary"
        onClick={() => setShowEditor(!showEditor)}
        rightIcon={showEditor ? <ChevronUp/> : <ChevronDown />}
      />
    </div>
  </ItemList.Row>
}

function ExtendedDanceListRow({ dance }: { dance: DanceWithEvents }) {
  return <Card>
    <DanceEditor dance={dance} showLink />
  </Card>
}
