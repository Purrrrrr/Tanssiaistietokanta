import {useMemo} from 'react'
import {string} from 'yup'

import {usePatchWorkshop} from 'services/workshops'

import {DragHandle, formFor, Input, patchStrategy, SyncStatus, TextArea, useAutosavingState, UseAutosavingStateReturn} from 'libraries/forms'
import {CssClass, Flex, FormGroup} from 'libraries/ui'
import {DanceChooser} from 'components/widgets/DanceChooser'
import {useT, useTranslation} from 'i18n'
import { guid } from 'utils/guid'

import {Event} from 'types'

import './WorkshopEditor.scss'

type Workshop = Event['workshops'][0]

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
  const t = useT('components.workshopEditor')
  const [modifyWorkshop] = usePatchWorkshop({
    refetchQueries: ['getEvent']
  })
  const saveWorkshop = (data: Partial<Workshop>) => {
    const {instances, name, abbreviation, description, teachers} = data
    const { _id: instanceId, dances } = instances?.[0] ?? { _id: guid() }
    return modifyWorkshop({
      id: workshopId,
      workshop: {
        name,
        abbreviation,
        description,
        teachers,
        instances: [
          {
            _id: instanceId,
            danceIds: dances ? dances.map(d => d._id) : []
          }
        ]
      }
    })
  }

  const { formProps, state } = useAutosavingState<Workshop, Partial<Workshop>>(workshopInDatabase, saveWorkshop, patchStrategy.partial)

  const {_id: workshopId, instances } = formProps.value
  const dances = instances.flatMap(i => i.dances)

  return <Form className="workshopEditor" {...formProps}>
    <SyncStatus state={state} floatRight/>
    <Flex spaced wrap>
      <div style={{flexGrow: 1, flexBasis: 300, maxWidth: '50ch'}}>
        <Field path="name" required component={Input} label={t('name')} labelInfo={t('required')} />
        <AbbreviationField path="abbreviation" label={t('abbreviation')} reservedAbbreviations={reservedAbbreviations} />
        <Field path="description" component={TextArea} label={t('description')} />
        <Field path="teachers" component={Input} label={t('teachers')}/>
      </div>
      <div style={{flexGrow: 1, flexBasis: 300}}>
        <ListField label={t('dances')} path="instances.0.dances" component={DanceListItem} renderConflictItem={item => item.name} />
        {dances.length === 0 && <p className={CssClass.textMuted}>{t('noDances')}</p>}
        <AddDanceChooser />
      </div>
    </Flex>
  </Form>
}

function AbbreviationField({label, path, reservedAbbreviations}) {
  const t = useT('components.workshopEditor')
  const maxLenErrorMsg = useTranslation('validationMessage.maxLength')
  const schema = useMemo(
    () => {
      return string()
        .notOneOf(reservedAbbreviations, getAbbreviationTakenError)
        .nullable()
        .max(3, maxLenErrorMsg)

      function getAbbreviationTakenError({value, values}) {
        return t(
          'abbreviationTaken',
          {abbreviations: values, abbreviation: value}
        )
      }
    }
    ,
    [reservedAbbreviations, maxLenErrorMsg, t]
  )

  return <Field
    path={path}
    component={Input}
    label={label}
    schema={schema}
    helperText={t('abbreviationHelp')}
  />
}

function DanceListItem(
  {itemIndex, dragHandle}: {itemIndex: number, dragHandle: DragHandle}
) {
  const t = useT('components.workshopEditor')
  const excludeFromSearch = useValueAt('instances.0.dances')
  return <Flex className="danceItem">
    <Field label={t('dances')} labelStyle="hidden" path={`instances.0.dances.${itemIndex}`} component={DanceChooser} componentProps={{excludeFromSearch}} />
    {dragHandle}
    <RemoveItemButton path="instances.0.dances" index={itemIndex} text="X" />
  </Flex>
}

function AddDanceChooser() {
  const t = useT('components.workshopEditor')
  const dances = useValueAt('instances.0.dances')
  const onAddDance = useAppendToList('instances.0.dances')

  return <FormGroup label={t('addDance')} labelStyle="beside" style={{marginTop: 6}}>
    <DanceChooser excludeFromSearch={dances} value={null} onChange={dance => dance && onAddDance(dance)} key={dances.length} />
  </FormGroup>
}
