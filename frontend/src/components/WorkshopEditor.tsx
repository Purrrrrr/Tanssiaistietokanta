import {useMemo} from 'react'
import {string} from 'yup'

import {usePatchWorkshop} from 'services/workshops'

import {ActionButton as Button, DateField, DragHandle, formFor, NumberInput, patchStrategy, SyncStatus, TextArea, useAutosavingState} from 'libraries/forms'
import {Card, CssClass, Flex, FormGroup} from 'libraries/ui'
import {DanceChooser} from 'components/widgets/DanceChooser'
import {useT, useTranslation} from 'i18n'
import { guid } from 'utils/guid'

import {Event} from 'types'

import './WorkshopEditor.scss'

type Workshop = Event['workshops'][0]
type Instance = Workshop['instances'][number]

const {
  Input,
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
  const workshopId = workshopInDatabase._id
  const saveWorkshop = (data: Partial<Workshop>) => {
    const {instances, name, abbreviation, description, teachers} = data
    return modifyWorkshop({
      id: workshopId,
      workshop: {
        name,
        abbreviation,
        description,
        teachers,
        instances: instances?.map(({dances, __typename, ...i}) => ({...i, danceIds: dances ? dances.map(d => d._id) : null})),
      }
    })
  }

  const { formProps, state } = useAutosavingState<Workshop, Partial<Workshop>>(workshopInDatabase, saveWorkshop, patchStrategy.partial)

  const addInstance = (instance: Instance) => formProps.onChange(w => ({...w, instances: [...w.instances, instance]}), 'instances')

  return <Form className="workshopEditor" {...formProps}>
    <SyncStatus state={state} floatRight/>
    <Flex spaced wrap>
      <div style={{flexGrow: 1, flexBasis: 300, maxWidth: '50ch'}}>
        <Input path="name" required label={t('name')} labelInfo={t('required')} />
        <AbbreviationField path="abbreviation" label={t('abbreviation')} reservedAbbreviations={reservedAbbreviations} />
        <Field path="description" component={TextArea} label={t('description')} />
        <Input path="teachers" label={t('teachers')}/>
      </div>
      <div style={{flexGrow: 1, flexBasis: 300}}>
        <ListField label={t('instances')} path="instances" component={WorkshopInstanceEditor} renderConflictItem={item => item?.dances?.map(d => d.name)?.join(', ') ?? ''} />
        <Button text={t('addInstance')} onClick={() => addInstance(newInstance(formProps.value.instances[0]))} />
      </div>
    </Flex>
  </Form>
}

function newInstance(reference: Instance): Instance {
  return {
    _id: guid(),
    abbreviation: '',
    dateTime: '0000-01-01T00:00:00.000',
    durationInMinutes: reference.durationInMinutes,
    dances: null,
  }
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

  return <Input
    path={path}
    label={label}
    schema={schema}
    helperText={t('abbreviationHelp')}
  />
}

function WorkshopInstanceEditor(
  {itemIndex, dragHandle}: {itemIndex: number, dragHandle: DragHandle}
) {
  const t = useT('components.workshopEditor')
  const dances = useValueAt(`instances.${itemIndex}.dances`)
  return <Card>
    <Flex spaced wrap alignItems="center">
      <DateField<Workshop> path={`instances.${itemIndex}.dateTime`} label={t('dateTime')} showTime containerClassName="flex-fill" />
      <Field component={NumberInput} path={`instances.${itemIndex}.durationInMinutes`} label={t('duration')} containerClassName="flex-fill" />
      <div>
        {dragHandle}
        <RemoveItemButton path="instances" index={itemIndex} text="X" />
      </div>
    </Flex>
    <Input path={`instances.${itemIndex}.abbreviation`} label={t('instanceAbbreviation')} helperText={t('instanceAbbreviationHelp')} />
    <ListField label={t('dances')} path={`instances.${itemIndex}.dances`} component={DanceListItem} renderConflictItem={item => item.name} />
    {dances?.length === 0 && <p className={CssClass.textMuted}>{t('noDances')}</p>}
    <AddDanceChooser instance={itemIndex} />
  </Card>
}

function DanceListItem(
  {path, itemIndex, dragHandle}: {path: `instances.${number}.dances`, itemIndex: number, dragHandle: DragHandle}
) {
  const t = useT('components.workshopEditor')
  const excludeFromSearch = useValueAt(path) ?? []
  return <Flex className="danceItem">
    <Field label={t('dances')} labelStyle="hidden" path={`${path}.${itemIndex}`} component={DanceChooser} componentProps={{excludeFromSearch}} />
    {dragHandle}
    <RemoveItemButton path={path} index={itemIndex} text="X" />
  </Flex>
}

function AddDanceChooser({instance}: {instance: number}) {
  const t = useT('components.workshopEditor')
  const dances = useValueAt(`instances.${instance}.dances`) ?? []
  const onAddDance = useAppendToList(`instances.${instance}.dances`)

  return <FormGroup label={t('addDance')} labelStyle="beside" style={{marginTop: 6}}>
    <DanceChooser excludeFromSearch={dances} value={null} onChange={dance => dance && onAddDance(dance)} key={dances.length} />
  </FormGroup>
}
