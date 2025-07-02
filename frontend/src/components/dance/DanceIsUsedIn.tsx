import { useId } from 'react'
import { DocumentOpen, Link as LinkIcon, TimelineEvents } from '@blueprintjs/icons'

import {DanceWithEvents} from 'types'

import { Select } from 'libraries/formsV2/components/inputs'
import {Button, Link } from 'libraries/ui'
import { useT } from 'i18n'

export function DanceIsUsedIn({events, minimal, wikipageName }: Pick<DanceWithEvents, 'events'> & { minimal?: boolean, wikipageName?: string | null }) {
  const id = useId()
  const t = useT('components.danceEditor')
  if (events.length === 0) return null

  const buttonText = t(wikipageName ? 'danceUsedInEventsAndWiki' : 'danceUsedInEvents', {count: events.length})
  const eventLinks = events.map(event => ({ text: event.name, link: `/events/${event._id}`}))
  const links = wikipageName
    ? {
      categories: [
        {
          title: t('danceEvents'),
          items: eventLinks,
        },
        {
          title: t('danceInDanceWiki'),
          items: [{
            text: 'Tanssiwiki: '+wikipageName,
            link: `https://tanssi.dy.fi/${wikipageName.replaceAll(' ', '_')}`,
          }],
        },
      ]
    }
    : eventLinks

  return <Select
    id={id}
    items={links}
    value={eventLinks[0]}
    onChange={() => { /* nop */  }}
    itemToString={link => link.text}
    itemClassName=""
    buttonRenderer={(_, props) =>
      <Button
        active={props['aria-expanded']}
        minimal
        rightIcon="caret-down"
        text={minimal
          ? <>
            <TimelineEvents />
            {events.length}
            {wikipageName && <>{' '}<DocumentOpen /> 1</>}
          </>
          : buttonText}
        {...props}
        aria-label={buttonText}
      />
    }
    itemRenderer={link =>
      <Link to={link.link} className="flex gap-2 py-1.5 px-2 hover:no-underline">
        <LinkIcon />
        <span className="whitespace-nowrap">{link.text}</span>
      </Link>
    }
  />
}
