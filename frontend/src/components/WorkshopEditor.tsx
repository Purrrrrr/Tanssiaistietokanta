import { Fragment, useMemo } from 'react'
import { string } from 'yup'

import { Event } from 'types'

import { useEventRoles } from 'services/eventRoles'
import { usePatchWorkshop, workshopInstanceName } from 'services/workshops'

import { DateField, DragHandle, formFor, NumberInput, patchStrategy, SyncStatus, useAutosavingState } from 'libraries/forms'
import { DocumentContentEditor } from 'libraries/lexical'
import { ColorClass, FormGroup, H2 } from 'libraries/ui'
import { DanceChooser } from 'components/widgets/DanceChooser'
import { useT, useTranslation } from 'i18n'
import randomId from 'utils/randomId'

import { VolunteerAssignmentEditor as VolunteerAssignmentSelector } from './volunteers/VolunteerAssignmentEditor'
import { AddButton } from './widgets/AddButton'
import { PageSection } from './widgets/PageSection'

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
  eventId: string
  workshop: Workshop
  reservedAbbreviations: string[]
  beginDate: string
  endDate: string
}

export function WorkshopEditor({ eventId, workshop: workshopInDatabase, reservedAbbreviations, beginDate, endDate }: WorkshopEditorProps) {
  const t = useT('components.workshopEditor')
  const [modifyWorkshop] = usePatchWorkshop({
    refetchQueries: ['getEvent'],
  })
  const [roles = []] = useEventRoles()
  const workshopRoles = roles.filter(r => r.appliesToWorkshops)
  const workshopId = workshopInDatabase._id
  const saveWorkshop = (data: Partial<Workshop>) => {
    const { instances, name, abbreviation, description, instanceSpecificDances } = data
    return modifyWorkshop({
      id: workshopId,
      workshop: {
        name,
        abbreviation,
        description,
        instanceSpecificDances,
        instances: instances?.map(({ dances, __typename, hasVolunteerAssignments: _ignore, ...i }) => ({
          ...i,
          danceIds: dances ? dances.map(d => d._id) : null,
        })),
      },
    })
  }

  const { formProps, state } = useAutosavingState<Workshop, Partial<Workshop>>(workshopInDatabase, saveWorkshop, patchStrategy.partial)
  const readOnly = workshopInDatabase._versionId != null
  const addInstance = (instance: Instance) => formProps.onChange(w => ({ ...w, instances: [...w.instances, instance] }), 'instances')

  return <Form className="workshopEditor" {...formProps} readOnly={readOnly}>
    <SyncStatus state={state} floatRight />
    <div className="grid grid-cols-2 gap-3.5">
      <Input path="name" required label={t('name')} labelInfo={t('required')} />
      <AbbreviationField path="abbreviation" label={t('abbreviation')} reservedAbbreviations={reservedAbbreviations} />
    </div>
    <Field path="description" component={DocumentContentEditor} label={t('description')} componentProps={{ className: 'min-h-50' }} />
    {workshopRoles.map(role =>
      <Fragment key={role._id}>
        <H2>{role.plural}</H2>
        <VolunteerAssignmentSelector
          id={`workshop-${workshopId}-role-${role._id}`}
          eventId={eventId}
          roleId={role._id}
          workshopId={workshopInDatabase._id}
          workshopVersionId={workshopInDatabase._versionId ?? undefined}
          workshopInstances={
            role.type !== 'TEACHER' ? workshopInDatabase.instances : undefined
          }
        />
      </Fragment>,
    )}
    <PageSection
      title={t('instancesAndDances')}
      toolbar={
        <div className="flex items-center gap-3">
          <Switch path="instanceSpecificDances" label={t('instanceSpecificDances')} inline />
          <AddButton text={t('addInstance')} onClick={() => addInstance(newInstance(formProps.value.instances[0]))} />
        </div>
      }
    >
      {formProps.value.instanceSpecificDances || <DanceList instanceIndex={0} bigTitle readOnly={readOnly} />}
      <ListField
        label={t('instances')}
        labelStyle="hidden"
        path="instances"
        componentProps={{ beginDate, endDate, readOnly }}
        component={WorkshopInstanceEditor}
        renderConflictItem={item => item?.dances?.map(d => d.name)?.join(', ') ?? ''}
      />
    </PageSection>
  </Form>
}

export function newInstance(reference?: Instance, date?: string): Instance {
  return {
    _id: randomId(),
    abbreviation: '',
    dateTime: reference?.dateTime ?? `${date ?? new Date().toISOString().slice(0, 10)}T12:00:00.000`,
    durationInMinutes: reference?.durationInMinutes ?? 105,
    dances: null,
    hasVolunteerAssignments: false,
  }
}

function AbbreviationField({ label, path, reservedAbbreviations }) {
  const t = useT('components.workshopEditor')
  const maxLenErrorMsg = useTranslation('validationMessage.maxLength')
  const schema = useMemo(
    () => {
      return string()
        .notOneOf(reservedAbbreviations, getAbbreviationTakenError)
        .nullable()
        .max(3, maxLenErrorMsg)

      function getAbbreviationTakenError({ value, values }) {
        return t(
          'abbreviationTaken',
          { abbreviations: values, abbreviation: value },
        )
      }
    },
    [reservedAbbreviations, maxLenErrorMsg, t],
  )

  return <Input
    path={path}
    label={label}
    schema={schema}
    helperText={t('abbreviationHelp')}
  />
}

function WorkshopInstanceEditor(
  { itemIndex, dragHandle, beginDate, endDate, readOnly }: { itemIndex: number, dragHandle: DragHandle, beginDate: string, endDate: string, readOnly: boolean },
) {
  const t = useT('components.workshopEditor')
  const instances = useValueAt('instances')
  const instance = instances[itemIndex]
  const showDances = useValueAt('instanceSpecificDances')
  return <div className="pt-1 pb-4 mb-5 bg-white border-b-1 border-black/15">
    <div className="flex flex-wrap gap-3.5 justify-between items-center">
      <h3 className="font-bold">{t('instance')} {workshopInstanceName(itemIndex, instance)}</h3>
      <div>
        {dragHandle}
        {instances.length > 1 &&
          <RemoveItemButton
            path="instances"
            index={itemIndex}
            text="X"
            tooltip={instance.hasVolunteerAssignments ? t('cannotRemoveInstanceWithVolunteers') : undefined}
            disabled={instance.hasVolunteerAssignments} />
        }
      </div>
    </div>
    <div className="flex flex-wrap gap-3.5 items-center">
      {showDances &&
        <Input
          containerClassName="basis-40"
          path={`instances.${itemIndex}.abbreviation`}
          label={t('instanceAbbreviation')}
          componentProps={{ size: 5 }} />
      }
      <DateField<Workshop>
        path={`instances.${itemIndex}.dateTime`}
        label={t('dateTime')}
        showTime
        containerClassName="grow"
        minDate={beginDate}
        maxDate={endDate}
      />
      <Field component={NumberInput} path={`instances.${itemIndex}.durationInMinutes`} label={t('duration')} containerClassName="grow" />
    </div>
    {showDances && <p className={`mt-2 ${ColorClass.textMuted}`}>{t('instanceAbbreviationHelp')}</p>}
    {showDances && <DanceList instanceIndex={itemIndex} readOnly={readOnly} />}
  </div>
}

function DanceList({ instanceIndex, bigTitle, readOnly }: { instanceIndex: number, bigTitle?: boolean, readOnly: boolean }) {
  const t = useT('components.workshopEditor')
  const dances = useValueAt(`instances.${instanceIndex}.dances`)
  return <>
    {bigTitle && <h3 className="my-2 text-base font-bold">{t('dances')}</h3>}
    <ListField
      labelStyle={bigTitle ? 'hidden' : 'above'}
      label={t('dances')}
      path={`instances.${instanceIndex}.dances`}
      component={DanceListItem}
      renderConflictItem={item => item.name}
    />
    {!dances?.length && <p className={`my-2 ${ColorClass.textMuted}`}>{t('noDances')}</p>}
    {!readOnly && <AddDanceChooser instance={instanceIndex} />}
  </>
}

function DanceListItem(
  { path, itemIndex, dragHandle }: { path: `instances.${number}.dances`, itemIndex: number, dragHandle: DragHandle },
) {
  const t = useT('components.workshopEditor')
  const excludeFromSearch = useValueAt(path) ?? []
  return <div className="flex">
    <Field containerClassName="grow" label={t('dances')} labelStyle="hidden" path={`${path}.${itemIndex}`} component={DanceChooser} componentProps={{ excludeFromSearch }} />
    {dragHandle}
    <RemoveItemButton path={path} index={itemIndex} text="X" />
  </div>
}

function AddDanceChooser({ instance }: { instance: number }) {
  const t = useT('components.workshopEditor')
  const dances = useValueAt(`instances.${instance}.dances`) ?? []
  const onAddDance = useAppendToList(`instances.${instance}.dances`)

  return <FormGroup label={t('addDance')} labelStyle="beside" className="mt-1.5">
    <DanceChooser excludeFromSearch={dances} value={null} onChange={dance => dance && onAddDance(dance)} key={dances.length} />
  </FormGroup>
}
