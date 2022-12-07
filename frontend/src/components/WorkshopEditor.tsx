import React from 'react'

import {backendQueryHook, graphql} from 'backend'
import {useModifyWorkshop} from 'services/workshops'

import {formFor, Input, patchStrategy, SyncStatus, TextArea, useAutosavingState} from 'libraries/forms'
import {CssClass, FormGroup} from 'libraries/ui'
import {Flex} from 'components/Flex'
import {DanceChooser} from 'components/widgets/DanceChooser'
import {makeTranslate} from 'utils/translate'

import {Workshop} from 'types'

const t = makeTranslate({
  dances: 'Tanssit',
  addDance: 'Lisää tanssi: ',
  noDances: 'Työpajan tanssilista on tyhjä.',
  name: 'Nimi',
  required: '(pakollinen)',
  abbreviation: 'Lyhennemerkintä',
  abbreviationHelp: 'Lyhennemerkintä näytetään settilistassa työpajassa opetettujen tanssien kohdalla',
  abbreviationTaken: 'Lyhenne %(abbreviation)s on jo käytössä toisessa pajassa. Tässä tapahtumassa ovat jo käytössä seuraavat lyhenteet: %(abbreviations)s',
  description: 'Työpajan kuvaus',
  teachers: 'Opettaja(t)',
})

const {
  Form,
  Field,
  ListField,
  RemoveItemButton,
  useValueAt,
  useAppendToList,
} = formFor<Workshop>()

interface WorkshopEditorProps {
  workshop: Workshop
}

export function WorkshopEditor({workshop: workshopInDatabase}: WorkshopEditorProps) {
  const [modifyWorkshop] = useModifyWorkshop({
    refetchQueries: ['getEvent']
  })
  const saveWorkshop = (data: Workshop) => {
    const {dances, name, abbreviation, description, teachers} = data
    modifyWorkshop({
      id: workshop._id,
      workshop: {
        name,
        abbreviation,
        description,
        teachers,
        danceIds: dances.map(d => d._id)
      }
    })
  }
  const [workshop, setWorkshop, {state}] = useAutosavingState<Workshop, Workshop>(workshopInDatabase, saveWorkshop, patchStrategy.noPatch)

  const {eventId, dances} = workshop

  return <Form className={CssClass.limitedWidth} value={workshop} onChange={setWorkshop}>
    <SyncStatus state={state} />
    <Field path="name" required component={Input} label={t`name`} labelInfo={t`required`} />
    <AbbreviationField path="abbreviation" label={t`abbreviation`} workshopId={workshop._id} eventId={eventId} />
    <Field path="description" component={TextArea} label={t`description`} />
    <Field path="teachers" component={Input} label={t`teachers`}/>
    <t.h2>dances</t.h2>
    <ListField label={t`dances`} path="dances" component={DanceListItem} />
    {dances.length === 0 && <t.p className={CssClass.textMuted}>noDances</t.p>}
    <AddDanceChooser />
  </Form>
}

function AbbreviationField({workshopId, label, eventId, path}) {
  const usedWorkshopAbbreviations = useTakenWorkshopAbbreviations(eventId, workshopId)

  return <Field
    path={path}
    component={Input}
    label={label}
    helperText={t`abbreviationHelp`}
    maxLength={3}
    validate={{notOneOf: usedWorkshopAbbreviations, nullable: true}}
    errorMessages={{notOneOf: getAbbreviationTakenError}}
  />
}

function getAbbreviationTakenError({value, values}) {
  return t(
    'abbreviationTaken',
    {abbreviations: values, abbreviation: value}
  )
}

const useWorkshops = backendQueryHook(graphql(`
query GetEventWorkshopAbbreviations($eventId: ID!) {
  event(id: $eventId) {
    workshops {
      _id, abbreviation
    }
  }
}`))

function useTakenWorkshopAbbreviations(eventId, workshopId) {
  const {data} = useWorkshops({eventId})
  if (!data?.event) return []

  return data.event.workshops
    .filter(w => w._id !== workshopId && w.abbreviation)
    .map(w => w.abbreviation)
}

function DanceListItem({itemIndex, path, dragHandle}) {
  const excludeFromSearch = useValueAt('dances')
  return <Flex>
    <Field label={t`Dance`} labelStyle="hidden" path={`dances.${itemIndex}`} component={DanceChooser} componentProps={{excludeFromSearch}} />
    {dragHandle}
    <RemoveItemButton path="dances" index={itemIndex} text="X" />
  </Flex>
}

function AddDanceChooser() {
  const dances = useValueAt('dances')
  const onAddDance = useAppendToList('dances')

  return <FormGroup label={t`addDance`} labelStyle="beside" style={{marginTop: 6}}>
    <DanceChooser excludeFromSearch={dances} value={null} onChange={dance => dance && onAddDance(dance)} key={dances.length} />
  </FormGroup>
}
