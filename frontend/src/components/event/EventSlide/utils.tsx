import { DanceSet, EventProgram, Workshop } from './types'

import {Markdown} from 'libraries/ui'
import { SlideLink } from 'components/Slide'
import {useTranslation} from 'i18n'

export function linkToDanceSet(danceSet?: DanceSet | null): SlideLink | undefined {
  if (!danceSet) return undefined
  return {
    id: danceSet._id,
    title: danceSet.title
  }
}

export function intervalMusicTitle<T>(eventProgram: EventProgram, danceSet: DanceSet): string | undefined {
  const { defaultIntervalMusic } = eventProgram

  return (danceSet.intervalMusic?.name ?? defaultIntervalMusic?.name)
    || undefined
}

export function DefaultIntervalMusicTitle() {
  return useTranslation('pages.events.ballProgram.intervalMusic')
}

export function RequestedDancePlaceholder() {
  return useTranslation('pages.events.ballProgram.requestedDance')
}

export function TeachedIn({teachedIn}: {teachedIn: Workshop[]}) {
  const teachedInStr = teachedIn.map(
    ({workshop, instances}) => instances
      ? `${workshop.name} (${instances.map(i => i.abbreviation).join('/')})`
      : workshop.name
  ).join(', ')

  return `${useTranslation('pages.events.ballProgram.teachedInSet')} ${teachedInStr}`
}

export function markdown(md?: string | null) {
  return <Markdown className="slide-program-description-content">
    {md ?? ''}
  </Markdown>
}
