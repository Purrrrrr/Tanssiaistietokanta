import {Dance} from 'types'
import {DanceSet, EventProgramSettings} from 'components/event/EventProgramForm/types'

import { useDances } from 'services/dances'

import {Callout, Link, RegularLink} from 'libraries/ui'
import { useChosenDanceIds, useWorkshops } from 'components/event/EventProgramForm/eventMetadata'
import { ColoredTag } from 'components/widgets/ColoredTag'
import {useT} from 'i18n'
import { compareBy } from 'utils/sorted'
import {uniq} from 'utils/uniq'

import { useLinkToSlide } from '../useLinkToSlide'

export function MissingDanceInstructionsCounterTag() {
  const count = useDancesWithMissingInstructions().length
  const t = useT('components.eventProgramEditor.missingDanceInstructionsWarning')
  if (!count) return null

  return <span className="inline-block rounded-full bg-red-600 text-white font-bold h-5 px-2 align-middle ms-2 -mt-0.5">
    {count} {t('missingDancesCount', {count})}
  </span>
}

export function MissingDanceInstructionsWarning({program}: {program: EventProgramSettings}) {
  const t = useT('components.eventProgramEditor.missingDanceInstructionsWarning')
  const linkToSlide = useLinkToSlide()
  const missing = program.danceSets
    .flatMap(danceSet => {
      return danceSet.program
        .map(row => {
          if (row.item.__typename !== 'Dance') return null
          if (!isMissingInstruction(row.item)) return null

          return { id: row._id, danceSet, dance: row.item }
        })
        .filter(row => row !== null)
    })
    .sort(compareBy(item => item.dance.name))

  if (missing.length === 0) return null

  return <Callout className="mb-4" intent="warning" title={t('programIsMissingInstructions')}>
    <p>{t('dancesWithoutInstructions', { count: missing.length })} {t('clickLinksToOpenSlide')}</p>
    <ul className="ps-3">
      {missing.map(({ id, danceSet, dance }) =>
        <li className="list-disc list-item my-1">
          <Link to={linkToSlide(id)}>
            {dance.name}
          </Link>
          {' '}
          {t('inSet')}
          {' '}
          <strong>{danceSet.title}</strong>
          {dance.teachedIn.length > 0 &&
            <span>
              {' '}(
              {t('teachedInSet')}
              {dance.teachedIn.map(workshop => <ColoredTag small title={workshop.workshop.name} />)}
              )
            </span>
          }
        </li>
      )}
    </ul>
  </Callout>
}

function useDancesWithMissingInstructions() {
  const [dances] = useDances()
  const chosenDanceIds = useChosenDanceIds()

  return Array.from(chosenDanceIds as Set<string>)
    .map(id => dances.find(dance => dance._id === id))
    .filter(dance => dance !== undefined)
    .filter(isMissingInstruction)
}

function isMissingInstruction(dance: { description?: string | null}) {
  const instructionLength = dance.description?.trim()?.length ?? 0
  return instructionLength < 10
}

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
