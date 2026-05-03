import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { EventRole, EventVolunteer } from 'types'

import { Collapse, FormGroup, SearchBar } from 'libraries/ui'
import { titleCase } from 'libraries/ui-showcase/utils/titleCase'
import { RoleTag } from 'components/eventVolunteers/RoleTag'
import { AddButton } from 'components/widgets/AddButton'
import { PageSection } from 'components/widgets/PageSection'
import { useT, useTranslation } from 'i18n'
import { sortedBy } from 'utils/sorted'

import { useCurrentEvent } from '../-context'
import { CreateEventVolunteerForm } from './-components/CreateEventVolunteerForm'
import { EventVolunteerList } from './-components/EventVolunteerList'
import { EventVolunteerRoleSelector } from './-components/EventVolunteerRoleSelect'
import { useSearchEventVolunteers, validateSearch } from './-components/useSearchEventVolunteers'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/volunteers/',
)({
  component: RouteComponent,
  validateSearch,
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
  const readOnly = event._versionId != null
  const [showAddForm, setShowAddForm] = useState(false)

  const {
    eventVolunteers,
    search, role, setSearch, setRole,
  } = useSearchEventVolunteers()

  return <PageSection title={t('title')} toolbar={
    <div className="flex flex-wrap gap-4 justify-between items-center grow">
      <EventVolunteerRoleCounts volunteers={eventVolunteers ?? []} currentRole={role} onSetRole={setRole} />
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
        {!readOnly && <AddButton text={t('addVolunteer')} onClick={() => setShowAddForm(v => !v)} />}
      </div>
    </div>
  }>
    {!readOnly && <Collapse isOpen={showAddForm}>
      <CreateEventVolunteerForm eventId={event._id} eventVolunteers={eventVolunteers} onClose={() => setShowAddForm(false)} />
    </Collapse>}
    <EventVolunteerList eventVolunteers={eventVolunteers ?? []} currentRole={role} onSetRole={setRole} readOnly={readOnly} />
  </PageSection>
}

export function EventVolunteerRoleCounts({ volunteers, currentRole, onSetRole }: { volunteers: EventVolunteer[], currentRole?: string, onSetRole: (roleId: string | undefined) => void }) {
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

  return <div className="flex flex-wrap gap-1">
    {roles.map(([role, count]) => (
      <RoleTag
        key={role._id}
        role={role}
        tag={count}
        selected={currentRole ? currentRole === role._id : undefined}
        onSetRole={onSetRole}
        title={count === 1 ? role.name : titleCase(role.pluralCount)}
      />
    ))}
  </div>
}
