import React, { useCallback, useMemo, useRef } from 'react'

import { ActionButton as Button, DragHandle } from '@/libraries/forms'
import { Card, H2, Icon, MenuButton, TooltipContainer } from '@/libraries/ui'
import { ColorClass } from '@/libraries/ui/classes'
import { DanceProgramChooser } from '@/components/event/DanceProgramChooser'
import {
  DanceSet,
  DanceSetPath,
  Field,
  Input,
  ListField,
  ProgramItemPath,
  ProgramSectionPath,
  RemoveItemButton,
  useOnChangeFor,
  useValueAt,
} from '@/components/event/EventProgramForm'
import { ProgramTypeIcon } from '@/components/event/ProgramTypeIcon'
import { getProgramDuration, getProgramName, SimpleEventProgramRow } from '@/components/event/utils'
import { Duration } from '@/components/widgets/Duration'
import { DurationField } from '@/components/widgets/DurationField'
import { useT, useTranslation } from '@/i18n'

import { AddIntroductionButton, DanceSetItemButtons, IntervalMusicSwitch } from './controls'
import { DanceSetNameEditor } from './DanceSetNameEditor'

export function IntroductoryInformation() {
  const t = useT('components.eventProgramEditor')
  const infos = useValueAt('introductions.program')
  if (infos.length === 0) return null

  return <DanceSetCard title={t('titles.introductoryInformation')}>
    <ProgramListEditor path="introductions" />
  </DanceSetCard>
}

export const DanceSetEditor = React.memo(function DanceSetEditor({ itemIndex, dragHandle }: { itemIndex: number, dragHandle: DragHandle }) {
  const id = useValueAt(`danceSets.${itemIndex}._id`)

  return <DanceSetCard
    id={id}
    title={<DanceSetNameEditor itemIndex={itemIndex} />}
    toolbar={<>
      {dragHandle}
      <RemoveItemButton
        path="danceSets"
        index={itemIndex}
        text={useTranslation('components.eventProgramEditor.buttons.removeDanceSet')}
      />
    </>}
  >
    <ProgramListEditor path={`danceSets.${itemIndex}`} />
  </DanceSetCard>
})

function DanceSetCard({ id, children, title, toolbar }: {
  id?: string
  children: React.ReactNode
  title: React.ReactNode
  toolbar?: React.ReactNode
}) {
  return <Card marginClass="my-4" noPadding className="min-w-fit" id={id}>
    <div className="flex flex-wrap py-1 px-2.5 bg-gray-50">
      <H2 className="grow">
        {title}
      </H2>
      {toolbar}
    </div>
    {children}
  </Card>
}

function ProgramListEditor({ path }: { path: ProgramSectionPath }) {
  const t = useT('components.eventProgramEditor')
  const tableRef = useRef(null)
  const programPath = `${path}.program` as const
  const accessibilityContainer = useRef<HTMLDivElement>(null)
  const programRow = useValueAt(path)
  const getType = useCallback((row: SimpleEventProgramRow) => row.type, [])
  const isIntroductionsSection = path.startsWith('introductions')
  const accepts = useMemo(() => isIntroductionsSection ? ['EventProgram'] : ['Dance', 'RequestedDance', 'EventProgram'], [isIntroductionsSection])
  if (!programRow) return null
  const { program } = programRow
  const intervalMusicDuration = isIntroductionsSection
    ? 0
    : (programRow as DanceSet).intervalMusic?.duration ?? 0
  const hasNotes = program.some(row => !!row.notes?.trim())

  return <>
    <div ref={accessibilityContainer} />
    <div ref={tableRef} className="grid grid-cols-[min-content_1fr_auto_min-content_min-content] *:even:not-last:bg-gray-100/80 *:border-t *:border-gray-200 *:grid *:grid-cols-subgrid *:col-span-full *:*:not-first:border-s *:*:border-gray-200">
      {(program.length + intervalMusicDuration) > 0 ?
        <div className="font-bold *:p-1.5">
          <div className="col-start-2 border-s">{t('columnTitles.name')}</div>
          <div className="col-start-3 border-s">
            {hasNotes
              ? t('columnTitles.notes')
              : <TooltipContainer tooltip={t('columnTitles.notes')}>
                {props => <Icon aria-label={t('columnTitles.notes')} icon="annotation" {...props} />}
              </TooltipContainer>
            }
          </div>
          <div className="col-span-2">{t('columnTitles.duration')}</div>
        </div>
        : <div className={`${ColorClass.textMuted} p-0 col-span-full`}>{t('programListIsEmpty')}</div>
      }
      <ListField
        labelStyle="hidden-nowrapper"
        label=""
        itemType={getType}
        acceptsTypes={accepts}
        // eslint-disable-next-line react-hooks/refs
        droppableElement={tableRef.current}
        path={programPath}
        component={ProgramItemEditor}
        renderConflictItem={row => getProgramName(row, t)}
      />
      {intervalMusicDuration > 0 && <IntervalMusicEditor danceSetPath={path as DanceSetPath} />}
      <div>
        <div className="col-span-3 p-1.5">
          <ProgramItemCounters program={programRow.program} />
          {isIntroductionsSection
            ? <AddIntroductionButton />
            : <DanceSetItemButtons path={path} />
          }
          {isIntroductionsSection ||
            <span className="ms-3">
              <IntervalMusicSwitch inline label={t('fields.intervalMusicAtEndOfSet')} path={`${path}.intervalMusic` as `danceSets.${number}.intervalMusic`} />
            </span>
          }
        </div>
        <div className="col-span-2 p-1.5">
          <DanceSetDuration program={program} intervalMusicDuration={intervalMusicDuration} />
        </div>
      </div>
    </div>
  </>
}

function ProgramItemCounters({ program }: { program: SimpleEventProgramRow[] }) {
  const t = useT('components.eventProgramEditor')
  const itemsByType = Object.groupBy(
    program,
    row => row.type,
  )
  const emptyPlaceholder = '-'
  const counts = [
    t('danceCount', { count: itemsByType.Dance?.length ?? 0 }),
    t('requestedDanceCount', { count: itemsByType.RequestedDance?.length ?? 0 }),
    t('otherProgramCount', { count: itemsByType.EventProgram?.length ?? 0 }),
  ].filter(count => count !== emptyPlaceholder).join(', ')

  return counts && <p>{counts}</p>
}

interface ProgramItemEditorProps {
  dragHandle: DragHandle
  path: `${ProgramSectionPath}.program`
  itemIndex: number
}

const ProgramItemEditor = React.memo(function ProgramItemEditor({ dragHandle, path, itemIndex }: ProgramItemEditorProps) {
  const t = useT('components.eventProgramEditor')
  const itemPath = `${path}.${itemIndex}` as ProgramItemPath
  const item = useValueAt(itemPath)

  if (!item) return null
  const { type } = item
  const editableDuration = type === 'EventProgram'

  return <React.Fragment>
    <ProgramTypeIcon type={type} className="size-7" />
    <ProgramDetailsEditor path={itemPath} />
    <NotesEditor path={itemPath} />
    <div className={editableDuration ? '' : 'p-1.5'}>
      {editableDuration
        ? <Field label={t('fields.eventProgram.duration')} inline labelStyle="hidden" path={`${itemPath}.eventProgram.duration`} component={DurationField} />
        : <Duration value={getProgramDuration(item)} />
      }
    </div>
    <div className="text-right whitespace-nowrap">
      {dragHandle}
      <RemoveItemButton path={path} index={itemIndex} text={t('buttons.remove')} iconOnly icon="cross" className="deleteItem" />
    </div>
  </React.Fragment>
})

function NotesEditor({ path }: { path: ProgramItemPath }) {
  const t = useT('components.eventProgramEditor')
  const notesPath = `${path}.notes` as const
  const notes = useValueAt(notesPath)
  const setNotes = useOnChangeFor(notesPath)
  const hasNote = !!notes?.trim()
  const button = useRef<HTMLButtonElement>(null)

  // Additional click area for notes, so that the user can click anywhere on the note to edit it
  /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
  return <div
    className="flex items-center justify-end"
    onClick={(e) => {
      if (
        !(e.target as HTMLElement).closest('button') // Not clicking on the button itself
        && !button.current?.classList.contains('active') // Not clicking on the button when it's already active
        && (document.getSelection()?.isCollapsed ?? true) // Not selecting text
      ) {
        button.current?.click()
      }
    }}
  >
    <span className="grow px-2 h-full leading-7.5">{notes}</span>
    <MenuButton buttonProps={{ text: t('buttons.editNote'), minimal: true, iconOnly: true, rightIcon: 'annotation', ref: button }}>
      <div className="flex flex-col p-2">
        <Input label={t('fields.eventProgram.notes')} path={notesPath} />
        {hasNote && <Button text={t('buttons.removeNote')} minimal color="danger" icon="trash" onClick={() => setNotes(null)} />}
      </div>
    </MenuButton>
  </div>
}

function ProgramDetailsEditor({ path }: { path: ProgramItemPath }) {
  const t = useT('components.eventProgramEditor')
  const type = useValueAt(`${path}.type`)
  // If something is deleted useValueAt may return undefined
  if (type === undefined) return null

  switch (type) {
    case 'Dance':
    case 'RequestedDance':
      return <Field
        label={t('dance')}
        labelStyle="hidden"
        containerClassName="w-full"
        path={path}
        component={DanceProgramChooser}
      />
    case 'EventProgram':
      return <Input
        label={t('fields.eventProgram.name')}
        labelStyle="hidden"
        containerClassName="w-full"
        path={`${path}.eventProgram.name`}
        required
      />
  }
}

function IntervalMusicEditor({ danceSetPath }: { danceSetPath: DanceSetPath }) {
  const t = useT('components.eventProgramEditor')
  const intervalMusicPath = `${danceSetPath}.intervalMusic` as const
  const durationPath = `${danceSetPath}.intervalMusic.duration` as const
  const onSetIntervalMusic = useOnChangeFor(intervalMusicPath)

  return <div>
    <ProgramTypeIcon type="IntervalMusic" className="size-7" />
    <div className="flex gap-2 items-center ps-2.5 col-span-2">
      {t('programTypes.IntervalMusic')}
      <Field
        label={t('dance')}
        labelStyle="hidden"
        containerClassName="grow"
        path={`${danceSetPath}.intervalMusic`}
        component={DanceProgramChooser}
      />
    </div>
    <Field label={t('fields.intervalMusicDuration')} inline labelStyle="hidden" path={durationPath} component={DurationField} />
    <div className="text-right">
      <Button text={t('buttons.remove')} iconOnly color="danger" icon="cross" onClick={() => onSetIntervalMusic(null)} className="delete" />
    </div>
  </div>
}

function DanceSetDuration({ program, intervalMusicDuration }: { program: SimpleEventProgramRow[], intervalMusicDuration: number }) {
  const t = useT('components.eventProgramEditor')
  const pause = useValueAt('pauseBetweenDances')
  const duration = program
    .map(getProgramDuration)
    .reduce((y, x) => x + y, 0)
  const durationWithPauses = duration + pause * program.length + intervalMusicDuration

  return <>
    <strong><Duration value={durationWithPauses} /></strong>{' ' + t('duration.pausesIncluded')}
    <br />
    <strong><Duration value={duration} /></strong>{' ' + t('duration.dances')}
  </>
}
