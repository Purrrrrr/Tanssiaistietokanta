import { useId } from 'react'
import { CaretDown, DocumentOpen, Link as LinkIcon, TimelineEvents } from 'libraries/ui/icons'

import { DanceWithEvents } from 'types'

import { Select } from 'libraries/formsV2/components/inputs'
import { Button, Link } from 'libraries/ui'
import { useT } from 'i18n'

export function DanceIsUsedIn({ events, minimal, wikipageName }: Pick<DanceWithEvents, 'events'> & { minimal?: boolean, wikipageName?: string | null }) {
  const id = useId()
  const t = useT('components')
  if (events.length === 0 && !wikipageName) return null

  const buttonText = t(wikipageName ? 'danceEditor.danceUsedInEventsAndWiki' : 'danceEditor.danceUsedInEvents', { count: events.length })
  const eventLinks = events.map(event => ({ text: event.name, link: `/events/${event._id}` }))
  const links = wikipageName
    ? {
      categories: [
        {
          title: t('danceEditor.danceEvents'),
          items: eventLinks,
        },
        {
          title: t('danceWikiPreview.danceInDanceWiki'),
          items: [{
            text: wikipageName,
            link: `https://tanssi.dy.fi/${wikipageName.replaceAll(' ', '_')}`,
          }],
        },
      ],
    }
    : eventLinks

  return <Select
    id={id}
    items={links}
    value={{ text: 'dummy', link: '' }}
    onChange={() => { /* nop */ }}
    itemToString={link => link.text}
    itemClassName=""
    buttonRenderer={(_, props) =>
      <Button
        active={props['aria-expanded']}
        minimal
        tooltip={minimal ? buttonText : undefined}
        rightIcon={<CaretDown />}
        text={minimal
          ? <>
            {wikipageName && <><DocumentOpen />{'1 '}</>}
            <span className={events.length === 0 ? 'text-gray-400' : ''}>
              <TimelineEvents /> {events.length}
            </span>
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
