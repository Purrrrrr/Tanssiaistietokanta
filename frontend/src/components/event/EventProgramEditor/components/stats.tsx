import { useDances } from 'services/dances'

import { Callout } from 'libraries/ui'
import { DanceCategoryTag } from 'components/dance/DanceCategoryTag'
import { useChosenDanceIds } from 'components/event/EventProgramForm/eventMetadata'
import { useT } from 'i18n'
import { sortedBy } from 'utils/sorted'

export function DanceCategoryStats() {
  const t = useT('components.eventProgramEditor.danceCategoryStats')
  const [dances] = useDances()
  const chosenDanceIds = useChosenDanceIds()
  const byCategory = Object.groupBy(
    Array.from(chosenDanceIds as Set<string>)
      .map(id => dances.find(dance => dance._id === id))
      .filter(dance => dance !== undefined),
    dance => dance.category ?? '',
  )

  const categories = sortedBy(
    Object.entries(byCategory).map(([name, dances]) => ({ name, count: dances?.length ?? 0 })),
    cat => -cat.count,
  )
    .filter(category => category.name !== '')

  if (!categories) return null

  return <Callout title={t('title')}>
    {categories.map(category =>
      <DanceCategoryTag key={category.name} tag={category.count} title={category.name} className="me-1" />,
    )}
  </Callout>
}
