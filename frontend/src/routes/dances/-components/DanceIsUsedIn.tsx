import { useId } from 'react'

import { DanceWithEvents } from 'types'

import { Select } from 'libraries/formsV2/components/inputs'
import { Button, Link } from 'libraries/ui'
import { CaretDown, DocumentOpen, Link as LinkIcon, TimelineEvents } from 'libraries/ui/icons'
import { useT } from 'i18n'

export function DanceIsUsedIn({ events, minimal, wikipageName }: Pick<DanceWithEvents, 'events'> & { minimal?: boolean, wikipageName?: string | null }) {
  const id = useId()
  const t = useT('components')
  if (events.length === 0 && !wikipageName) return null

  const buttonText = t(wikipageName ? 'danceEditor.danceUsedInEventsAndWiki' : 'danceEditor.danceUsedInEvents', { count: events.length })
  const eventLinks = events.map(event => ({
    text: event.name,
    eventId: event._id,
  }))
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

  return <Select<{ text: string, link?: never, eventId: string } | { text: string, link: string, eventId?: never }>
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
    itemRenderer={({ link, eventId, text }) => {
      const children = <><LinkIcon /><span className="whitespace-nowrap">{text}</span></>
      const className = 'flex gap-2 py-1.5 px-2 hover:no-underline'
      if (eventId) {
        return <Link to="/events/$eventId/{-$eventVersionId}" params={{ eventId }} className={className}>{children}</Link>
      }
      return <Link to={link} className={className}>{children}</Link>
    }}
  />
}
