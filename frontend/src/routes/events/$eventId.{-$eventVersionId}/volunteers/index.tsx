import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { EventRole, EventVolunteer, VolunteerListItem } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateEventVolunteer, useEventVolunteers, usePatchEventVolunteer } from 'services/eventVolunteers'

import { patchStrategy, useAutosavingState } from 'libraries/forms'
import { Button, Card, FormGroup, H2, SearchBar } from 'libraries/ui'
import { ChevronDown, ChevronUp, Edit } from 'libraries/ui/icons'
import { ItemList, Sort } from 'libraries/ui/ItemList'
import { titleCase } from 'libraries/ui-showcase/utils/titleCase'
import { RoleTag } from 'components/eventVolunteers/RoleTag'
import { useT, useTranslation } from 'i18n'
import { sortedBy } from 'utils/sorted'

import { useCurrentEvent } from '../-context'
import { DeleteEventVolunteerButton } from './-components/DeleteEventVolunteerButton'
import { emptyEventVolunteerForm, EventVolunteerForm, EventVolunteerFormValues } from './-components/EventVolunteerForm'
import { EventVolunteerRoleSelector } from './-components/EventVolunteerRoleSelect'

interface EventVolunteerSearchParams {
  search?: string
  role?: string
}

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/volunteers/',
)({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): EventVolunteerSearchParams => {
    return {
      search: typeof search.search === 'string' ? search.search : '',
      role: typeof search.role === 'string' ? search.role : undefined,
    }
  },
  staticData: {
    breadcrumb: 'routes.events.event.volunteers.title',
    requireRights: ({ eventId }) => ({
      rights: 'events:modify-volunteers',
      entityId: eventId,
    }),
  },
})

function RouteComponent() {
  const event = useCurrentEvent()
  const t = useT('routes.events.event.volunteers')
  const label = useT('domain.eventVolunteer')
  const { search, role, setSearch, setRole } = useEventVolunteerSearchParams()
  const [sort, setSort] = useState<Sort>({ key: 'interestedIn', direction: 'asc' })
  const readOnly = event._versionId != null

  const [unsortedEventVolunteers] = useEventVolunteers({ eventId: event._id, eventVersionId: event._versionId })
  const addedVolunteers = unsortedEventVolunteers.map(ev => ev.volunteer)

  const eventVolunteers = sortedBy(unsortedEventVolunteers ?? [], volunteerSorter(sort.key), sort.direction === 'desc')
    .filter(ev => {
      if (search && !ev.volunteer.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (role) {
        return ev.interestedIn.some(r => r._id === role)
      }
      return true
    })

  return <>
    <H2>{t('title')}</H2>
    <div className="flex gap-4 flex-wrap items-center justify-between mb- mb-4">
      <EventVolunteerRoleCounts volunteers={unsortedEventVolunteers ?? []} currentRole={role} onSetRole={setRole} />
      <div className="flex gap-4">
        <SearchBar
          id="search-volunteers"
          value={search}
          onChange={setSearch}
          placeholder={useTranslation('common.search')}
          emptySearchText={useTranslation('common.emptySearch')}
        />
        <FormGroup inline label={t('filterByRole')} labelFor="role-filter">
          <EventVolunteerRoleSelector id="role-filter" value={role} onChange={setRole} aria-label={t('filterByRole')} />
        </FormGroup>
      </div>
    </div>
    <p>{eventVolunteers?.length > 0 && t('Nvolunteers', { count: eventVolunteers?.length })}</p>
    <ItemList
      items={eventVolunteers ?? []}
      emptyText={t('noVolunteers')}
      columns="grid-cols-[1fr_1fr_1fr_1fr_max-content]"
    >
      <ItemList.SortableHeader currentSort={sort} onSort={setSort} columns={[
        { key: 'name', label: label('name') },
        { key: 'interestedIn', label: label('interestedIn') },
        { key: 'wishes', label: label('wishes') },
        { key: 'notes', label: label('notes') },
      ]} />
      {(eventVolunteers ?? []).map(ev =>
        <EventVolunteerListRow
          key={ev._id}
          eventVolunteer={ev}
          addedVolunteers={addedVolunteers}
          currentRole={role}
          onSetRole={setRole}
          readOnly={readOnly}
        />,
      )}
    </ItemList>
    {!readOnly && <CreateEventVolunteerForm eventId={event._id} addedVolunteers={addedVolunteers} />}
  </>
}

function useEventVolunteerSearchParams() {
  const search = Route.useSearch()
  const params = Route.useParams()
  const navigate = Route.useNavigate()

  return {
    search: '',
    ...search,
    setSearch(newSearch: string) {
      navigate({
        to: Route.to,
        params,
        search: { ...search, search: newSearch },
      })
    },
    setRole(roleId: string | undefined) {
      navigate({
        to: Route.to,
        params,
        search: roleId ? { ...search, role: roleId } : { ...search, role: undefined },
      })
    },
  }
}

function volunteerSorter(key: string) {
  switch (key) {
    default:
    case 'name':
      return (ev: EventVolunteer) => ev.volunteer.name
    case 'interestedIn':
      return (ev: EventVolunteer) => ev.interestedIn.map(role => role.order * 100 - ev.interestedIn.length).map(nr => String(nr).padStart(5, '0')).join('.')
    case 'wishes':
      return (ev: EventVolunteer) => ev.wishes ?? ''
    case 'notes':
      return (ev: EventVolunteer) => ev.notes ?? ''
  }
}

function EventVolunteerRoleCounts({ volunteers, currentRole, onSetRole }: { volunteers: EventVolunteer[], currentRole?: string, onSetRole: (roleId: string | undefined) => void }) {
  const roleCounts = new Map<Omit<EventRole, 'type'>, number>()
  volunteers.forEach(ev => {
    ev.interestedIn.forEach(role => {
      roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1)
    })
  })

  const roles = sortedBy(
    Array.from(roleCounts.entries()),
    ([role]) => role.order,
  )

  return <div className="flex gap-1 flex-wrap my-2">
    {roles.map(([role, count]) => (
      <RoleTag
        key={role._id}
        role={role}
        tag={count}
        selected={currentRole ? currentRole === role._id : undefined}
        onSetRole={onSetRole}
        title={count === 1 ? role.name : titleCase(role.plural)}
      />
    ))}
  </div>
}

interface EventVolunteerListRowProps {
  eventVolunteer: EventVolunteer
  addedVolunteers: VolunteerListItem[]
  currentRole?: string
  onSetRole: (roleId: string | undefined) => void
  readOnly?: boolean
}

function EventVolunteerListRow({ eventVolunteer: ev, addedVolunteers, currentRole, onSetRole, readOnly }: EventVolunteerListRowProps) {
  const [showEditor, setShowEditor] = useState(false)
  const t = useT('')

  return <ItemList.Row
    expandableContent={<EventVolunteerRowEditor item={ev} addedVolunteers={addedVolunteers} readOnly={readOnly} />}
    isOpen={showEditor}
  >
    <span>{ev.volunteer.name}</span>
    <span>
      {sortedBy(ev.interestedIn, item => item.order)
        .map(role =>
          <RoleTag
            key={role._id}
            role={role}
            selected={currentRole ? currentRole === role._id : undefined}
            onSetRole={onSetRole}
          />,
        )}
      {ev.interestedIn.length === 0 &&
        <span className="italic text-gray-500">{t('domain.eventVolunteer.noInterests')}</span>
      }
    </span>
    <span>{ev.wishes ? ev.wishes : <span className="italic text-gray-500">{t('domain.eventVolunteer.noWishes')}</span>}</span>
    <span>{ev.notes || '-'}</span>
    <div className="flex items-center gap-1">
      {!readOnly && <DeleteEventVolunteerButton minimal eventVolunteerId={ev._id} />}
      <Button
        requireRight="eventVolunteers:modify"
        entityId={ev._id}
        minimal
        icon={readOnly ? undefined : <Edit />}
        aria-label={t('common.edit')}
        tooltip={t('common.edit')}
        color="primary"
        onClick={() => setShowEditor(!showEditor)}
        rightIcon={showEditor ? <ChevronUp /> : <ChevronDown />}
      />
    </div>
  </ItemList.Row>
}

function EventVolunteerRowEditor({ item, addedVolunteers, readOnly }: {
  item: EventVolunteer
  addedVolunteers: VolunteerListItem[]
  readOnly?: boolean
}) {
  const [patchEventVolunteer] = usePatchEventVolunteer()

  const { formProps, state } = useAutosavingState<EventVolunteerFormValues, Partial<EventVolunteerFormValues>>(
    item,
    async (data) => {
      await patchEventVolunteer({
        id: item._id,
        eventVolunteer: {
          wishes: data.wishes,
          notes: data.notes,
          volunteerId: data.volunteer?._id,
          interestedIn: data.interestedIn?.map(r => r._id),
        },
      })
    },
    patchStrategy.partial,
  )

  return <EventVolunteerForm {...formProps} readOnly={readOnly} syncState={state} excludeVolunteers={addedVolunteers} className="px-4" />
}

function CreateEventVolunteerForm({ eventId, addedVolunteers }: { eventId: string, addedVolunteers: VolunteerListItem[] }) {
  const [formData, setFormData] = useState<EventVolunteerFormValues>(emptyEventVolunteerForm)
  const [createEventVolunteer] = useCreateEventVolunteer({ refetchQueries: ['getEventVolunteers'] })
  const t = useT('routes.events.event.volunteers')

  const handleSubmit = async (data: EventVolunteerFormValues) => {
    if (!data.volunteer) return
    await addGlobalLoadingAnimation(createEventVolunteer({
      eventVolunteer: {
        eventId,
        volunteerId: data.volunteer._id,
        interestedIn: data.interestedIn.map(r => r._id),
        wishes: data.wishes,
        notes: data.notes,
      },
    }))
    setFormData(emptyEventVolunteerForm())
  }

  return <Card>
    <H2>{t('addVolunteer')}</H2>
    <EventVolunteerForm
      value={formData}
      onChange={setFormData}
      onSubmit={handleSubmit}
      submitText={t('addVolunteer')}
      excludeVolunteers={addedVolunteers}
      isNew />
  </Card>
}
