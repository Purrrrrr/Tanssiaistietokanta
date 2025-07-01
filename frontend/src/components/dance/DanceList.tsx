import {useState} from 'react'
import { ChevronDown, ChevronUp } from '@blueprintjs/icons'

import { DanceWithEvents } from 'types'

import { Button, Card, Collapse, ColorClass } from 'libraries/ui'
import {DanceEditor, PlainDanceEditor} from 'components/DanceEditor'
import { InfiniteItemLoader } from 'components/InfiniteItemLoader'
import { ColoredTag } from 'components/widgets/ColoredTag'
import { useT, useTranslation } from 'i18n'

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

  return <ul className="mb-4 border-gray-100 border-1">
    <InfiniteItemLoader items={dances}>
      {dances => dances.map((dance : DanceWithEvents) => <DanceListRow key={dance._id} dance={dance} />)}
    </InfiniteItemLoader>
  </ul>
}

function DanceListRow({ dance }: { dance: DanceWithEvents }) {
  const t = useT('pages.dances.danceList')
  const [showEditor, setShowEditor] = useState(false)

  return <li className="even:bg-gray-100">
    <div className="flex flex-wrap justify-between items-center *:p-2">
      <div className="max-lg:min-w-[max(160px,50%)] lg:grow"><DanceLink dance={dance} /></div>
      <div className="max-lg:min-w-[max(160px,50%)] lg:w-80">
        {dance.category
          ? <ColoredTag title={dance.category} />
          : <span className={ColorClass.textMuted}>{t('noCategory')}</span>
        }
      </div>
      <div className="flex justify-end max-[360px]:flex-col max-[360px]:gap-2 max-md:w-full grow lg:max-w-80">
        {dance.events.length > 0
          ? <DanceIsUsedIn minimal events={dance.events} wikipageName={dance.wikipageName} />
          : <DeleteDanceButton minimal dance={dance} />
        }
        <Button
          minimal
          icon="edit"
          aria-label={useTranslation('common.edit')}
          color="primary"
          onClick={() => setShowEditor(!showEditor)}
          rightIcon={showEditor ? <ChevronUp/> : <ChevronDown />}
        />
      </div>
    </div>
    <Collapse isOpen={showEditor}>
      <PlainDanceEditor dance={dance} />
    </Collapse>
  </li>
}

function ExtendedDanceListRow({ dance }: { dance: DanceWithEvents }) {
  return <Card>
    <DanceEditor dance={dance} showLink />
  </Card>
}
