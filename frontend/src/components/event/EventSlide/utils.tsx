import { ReactElement } from 'react'

import { EventProgram, Workshop } from './types'

import {Markdown} from 'libraries/ui'
import {useTranslation} from 'i18n'

export function intervalMusicTitle(eventProgram: EventProgram, dancesetIndex: number): string | ReactElement {
  const { danceSets, defaultIntervalMusic } = eventProgram
  const danceSet = danceSets[dancesetIndex]

  return (danceSet.intervalMusic?.name ?? defaultIntervalMusic?.name)
    || <DefaultIntervalMusicTitle />
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
