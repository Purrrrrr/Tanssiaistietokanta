import {useMemo} from 'react'
import {string} from 'yup'

import {Event} from 'types'

import {usePatchWorkshop} from 'services/workshops'

import {ActionButton as Button, DateField, DragHandle, formFor, NumberInput, patchStrategy, SyncStatus, TextArea, useAutosavingState} from 'libraries/forms'
import {CssClass, Flex, FormGroup} from 'libraries/ui'
import {DanceChooser} from 'components/widgets/DanceChooser'
import {useT, useTranslation} from 'i18n'
import { guid } from 'utils/guid'

import './WorkshopEditor.scss'

type Workshop = Event['workshops'][0]
type Instance = Workshop['instances'][number]

const {
  Input,
  Form,
  Field,
  ListField,
  RemoveItemButton,
  Switch,
  useValueAt,
  useAppendToList,
} = formFor<Workshop>()

interface WorkshopEditorProps {
  workshop: Workshop
  reservedAbbreviations: string[]
  beginDate: string
  endDate: string
}

export function WorkshopEditor({workshop: workshopInDatabase, reservedAbbreviations, beginDate, endDate}: WorkshopEditorProps) {
  const t = useT('components.workshopEditor')
  const [modifyWorkshop] = usePatchWorkshop({
    refetchQueries: ['getEvent']
  })
  const workshopId = workshopInDatabase._id
  const saveWorkshop = (data: Partial<Workshop>) => {
    const {instances, name, abbreviation, description, teachers, instanceSpecificDances} = data
    return modifyWorkshop({
      id: workshopId,
      workshop: {
        name,
        abbreviation,
        description,
        teachers,
        instanceSpecificDances,
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
        <Switch path="instanceSpecificDances" label={t('instanceSpecificDances')} />
      </div>
      <div style={{flexGrow: 1, flexBasis: 300}}>
        {formProps.value.instanceSpecificDances || <DanceList instanceIndex={0} bigTitle />}
        <h3>{t('instances')}</h3>
        <ListField<'instances', Instance[], {beginDate: string, endDate: string}>
          label={t('instances')}
          labelStyle="hidden"
          path="instances"
          componentProps={{beginDate, endDate}}
          component={WorkshopInstanceEditor}
          renderConflictItem={item => item?.dances?.map(d => d.name)?.join(', ') ?? ''}
        />
        <Button text={t('addInstance')} onClick={() => addInstance(newInstance(formProps.value.instances[0]))} />
      </div>
    </Flex>
  </Form>
}

export function newInstance(reference?: Instance, date?: string): Instance {
  return {
    _id: guid(),
    abbreviation: '',
    dateTime: reference?.dateTime ?? `${date ?? new Date().toISOString().slice(0, 10)}T12:00:00.000`,
    durationInMinutes: reference?.durationInMinutes ?? 105,
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
  {itemIndex, dragHandle, beginDate, endDate}: {itemIndex: number, dragHandle: DragHandle, beginDate: string, endDate: string}
) {
  const t = useT('components.workshopEditor')
  const instances = useValueAt('instances')
  const showDances = useValueAt('instanceSpecificDances')
  return <div className="workshop-instance">
    <Flex spaced wrap alignItems="center">
      <DateField<Workshop>
        path={`instances.${itemIndex}.dateTime`}
        label={t('dateTime')}
        showTime
        containerClassName="flex-fill"
        minDate={beginDate}
        maxDate={endDate}
      />
      <Field component={NumberInput} path={`instances.${itemIndex}.durationInMinutes`} label={t('duration')} containerClassName="flex-fill" />
      <div>
        {dragHandle}
        {instances.length > 1 && <RemoveItemButton path="instances" index={itemIndex} text="X" />}
      </div>
    </Flex>
    {showDances && <Input path={`instances.${itemIndex}.abbreviation`} label={t('instanceAbbreviation')} helperText={t('instanceAbbreviationHelp')} />}
    {showDances && <DanceList instanceIndex={itemIndex} />}
  </div>
}

function DanceList({instanceIndex, bigTitle}: {instanceIndex: number, bigTitle?: boolean}) {
  const t = useT('components.workshopEditor')
  const dances = useValueAt(`instances.${instanceIndex}.dances`)
  return <>
    {bigTitle && <h3>{t('dances')}</h3>}
    <ListField
      labelStyle={bigTitle ? 'hidden' : 'above'}
      label={t('dances')}
      path={`instances.${instanceIndex}.dances`}
      component={DanceListItem}
      renderConflictItem={item => item.name}
    />
    {!dances?.length && <p className={CssClass.textMuted}>{t('noDances')}</p>}
    <AddDanceChooser instance={instanceIndex} />
  </>

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
