import {Dance} from 'types'
import {DanceSet, EventProgramSettings} from 'components/event/EventProgramForm/types'

import {Callout, RegularLink} from 'libraries/ui'
import { useChosenDanceIds, useWorkshops } from 'components/event/EventProgramForm/eventMetadata'
import {useT} from 'i18n'
import {uniq} from 'utils/uniq'


export function MissingDancesWarning() {
  const t = useT('components.eventProgramEditor.missingDancesWarning')
  const allDanceIds = useChosenDanceIds()
  const workshops = useWorkshops()
  const workshopsWithMissing = workshops
    .map(workshop => ({
      id: workshop._id,
      name: workshop.name,
      missingDances: workshop.instances
        .flatMap(instance => instance.dances)
        .filter(dance => dance != null)
        .filter(dance => !allDanceIds.has(dance._id))
    }))
    .filter(w => w.missingDances.length > 0)

  if (workshopsWithMissing.length === 0) return null

  const missingCount = workshopsWithMissing.flatMap(w => w.missingDances).length

  return <Callout intent="warning" title={t('title', { count: missingCount })}>
    {workshopsWithMissing.map(({id, name, missingDances}) =>
      <p key={id}>
        <strong>{name}</strong>
        {': '}
        {uniq(missingDances).map(dance => dance.name).join(', ')}
      </p>
    )}
  </Callout>
}

export function DuplicateDancesWarning({program}: {program: EventProgramSettings}) {
  const t = useT('components.eventProgramEditor.duplicateDancesWarning')

  const duplicateMap: {
    [key in string]: { dance: Dance, danceSets: DanceSet[] }
  } = {}

  for (const danceSet of program.danceSets.values()) {
    danceSet.program
      .map(row => row.item)
      .filter(item => item.__typename === 'Dance')
      .forEach(dance => {
        if (dance._id in duplicateMap) {
          duplicateMap[dance._id].danceSets.push(danceSet)
        } else {
          duplicateMap[dance._id] = { dance, danceSets: [danceSet]}
        }
      })
  }
  const duplicates = Object.values(duplicateMap)
    .filter(record => record.danceSets.length > 1)

  if (duplicates.length === 0) return null

  return <Callout intent="warning" title={t('title', { count: duplicates.length })}>
    {duplicates.map(({dance, danceSets}) => ({dance, danceSets: uniq(danceSets)}))
      .map(({dance, danceSets}) =>
        <p key={dance._id}>
          <strong>{dance.name}</strong>
          {': '}
          {t('inDanceSets', { count: danceSets.length })}
          {
            danceSets.map((danceSet, i) =>
              <>
                {i === 0 ? ' ' : ', '}
                <RegularLink key={danceSet._id} href={`#${danceSet._id}`}>{danceSet.title}</RegularLink>
              </>
            )
          }
        </p>
      )
    }
  </Callout>
}
