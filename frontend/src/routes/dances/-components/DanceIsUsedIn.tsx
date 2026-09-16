import { useId } from 'react'

import { DanceWithEvents } from '@/types'

import { Select } from '@/libraries/formsV2/components/inputs'
import { Button, Icon, Link } from '@/libraries/ui'
import { useT } from '@/i18n'

export function DanceIsUsedIn({ events, minimal }: Pick<DanceWithEvents, 'events'> & { minimal?: boolean }) {
  const id = useId()
  const t = useT('components')
  if (events.length === 0) return null

  const buttonText = t('danceEditor.danceUsedInEvents', { count: events.length })
  const links = events.map(event => ({
    text: event.name,
    eventId: event._id,
  }))

  return <Select<{ text: string, eventId: string }>
    id={id}
    items={links}
    value={{ text: 'dummy', eventId: '' }}
    onChange={() => { /* nop */ }}
    itemToString={link => link.text}
    itemClassName=""
    buttonRenderer={(_, props) =>
      <Button
        active={props['aria-expanded']}
        minimal
        tooltip={minimal ? buttonText : undefined}
        rightIcon="caretDown"
        text={minimal
          ? (
            <span className={events.length === 0 ? 'text-gray-400' : ''}>
              <Icon icon="timelineEvents" /> {events.length}
            </span>
          )
          : buttonText}
        {...props}
        aria-label={buttonText}
      />
    }
    itemRenderer={({ eventId, text }) => {
      const children = <><Icon icon="link" /><span className="whitespace-nowrap">{text}</span></>
      const className = 'flex gap-2 py-1.5 px-2 hover:no-underline'
      return <Link to="/events/$eventId/{-$eventVersionId}" params={{ eventId }} className={className}>{children}</Link>
    }}
  />
}
