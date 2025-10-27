import { Workshop } from './types'

import { Markdown } from 'libraries/ui'
import { useTranslation } from 'i18n'

export function TeachedIn({ teachedIn }: { teachedIn: Workshop[] }) {
  const teachedInStr = teachedIn.map(
    ({ workshop, instances }) => instances
      ? `${workshop.name} (${instances.map(i => i.abbreviation).join('/')})`
      : workshop.name,
  ).join(', ')

  return `${useTranslation('pages.events.ballProgram.teachedInSet')} ${teachedInStr}`
}

export function markdown(md?: string | null) {
  return <Markdown className="slide-program-description-content">
    {md ?? ''}
  </Markdown>
}
