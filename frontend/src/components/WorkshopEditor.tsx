import React from 'react'

import {useModifyWorkshop} from 'services/workshops'

import {formFor, Input, patchStrategy, SyncStatus, TextArea, useAutosavingState} from 'libraries/forms'
import {CssClass, FormGroup} from 'libraries/ui'
import {Flex} from 'components/Flex'
import {DanceChooser} from 'components/widgets/DanceChooser'
import {makeTranslate} from 'utils/translate'

import {Event} from 'types'

import './WorkshopEditor.scss'

type Workshop = Event['workshops'][0]

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
  reservedAbbreviations: string[]
}

export function WorkshopEditor({workshop: workshopInDatabase, reservedAbbreviations}: WorkshopEditorProps) {
  const [modifyWorkshop] = useModifyWorkshop({
    refetchQueries: ['getEvent']
  })
  const saveWorkshop = (data: Workshop) => {
    const {dances, name, abbreviation, description, teachers} = data
    modifyWorkshop({
      id: workshopId,
      workshop: {
        name,
        abbreviation,
        description,
        teachers,
        danceIds: dances.map(d => d._id)
      }
    })
  }
  const {formProps, state} = useAutosavingState<Workshop, Workshop>(workshopInDatabase, saveWorkshop, patchStrategy.noPatch)

  const {_id: workshopId, dances} = formProps.value

  return <Form className="workshopEditor" {...formProps}>
    <SyncStatus state={state} />
    <Flex spaced wrap>
      <div style={{flexGrow: 1, flexBasis: 300, maxWidth: '50ch'}}>
        <Field path="name" required component={Input} label={t`name`} labelInfo={t`required`} />
        <AbbreviationField path="abbreviation" label={t`abbreviation`} reservedAbbreviations={reservedAbbreviations} />
        <Field path="description" component={TextArea} label={t`description`} />
        <Field path="teachers" component={Input} label={t`teachers`}/>
      </div>
      <div style={{flexGrow: 1, flexBasis: 300}}>
        <ListField label={t`dances`} path="dances" component={DanceListItem} />
        {dances.length === 0 && <t.p className={CssClass.textMuted}>noDances</t.p>}
        <AddDanceChooser />
      </div>
    </Flex>
  </Form>
}

function AbbreviationField({label, path, reservedAbbreviations}) {
  return <Field
    path={path}
    component={Input}
    label={label}
    helperText={t`abbreviationHelp`}
    maxLength={3}
    validate={{notOneOf: reservedAbbreviations, nullable: true}}
    errorMessages={{notOneOf: getAbbreviationTakenError}}
  />
}

function getAbbreviationTakenError({value, values}) {
  return t(
    'abbreviationTaken',
    {abbreviations: values, abbreviation: value}
  )
}

function DanceListItem({itemIndex, path, dragHandle}) {
  const excludeFromSearch = useValueAt('dances')
  return <Flex className="danceItem">
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
