import { useId } from 'react'
import {useNavigate} from 'react-router-dom'
import { Link as LinkIcon } from '@blueprintjs/icons'

import {DanceWithEvents} from 'types'

import { Select } from 'libraries/formsV2/components/inputs'
import {Button, Link } from 'libraries/ui'
import { useT } from 'i18n'

export function DanceIsUsedIn({events}: Pick<DanceWithEvents, 'events'>) {
  const id = useId()
  const navigate = useNavigate()
  const t = useT('components.danceEditor')
  if (events.length === 0) return null

  return <Select
    id={id}
    items={events}
    value={events[0]}
    onChange={(event) => { if (event) navigate(`/events/${event._id}`) }}
    itemToString={event => event.name}
    itemClassName=""
    buttonRenderer={(_, props) =>
      <Button active={props['aria-expanded']} minimal rightIcon="caret-down" text={t('danceUsedInEvents', {count: events.length})} {...props} />
    }
    itemRenderer={event =>
      <Link to={`/events/${event._id}`} className="flex gap-2 py-1.5 px-2 hover:no-underline">
        <LinkIcon />
        <span className="whitespace-nowrap">{event.name}</span>
      </Link>
    }
  />
}
