import { useState } from 'react'

import { Volunteer } from 'types'

import { usePatchVolunteer } from 'services/volunteers'

import { patchStrategy, useAutosavingState } from 'libraries/forms'
import { Button } from 'libraries/ui'
import { ChevronDown, ChevronUp, Edit } from 'libraries/ui/icons'
import { ItemList, Sort } from 'libraries/ui/ItemList'
import { VolunteeredIn } from 'components/volunteers/VolunteeredIn'
import { useT } from 'i18n'
import { sortedBy } from 'utils/sorted'

import { DeleteVolunteerButton } from './DeleteVolunteerButton'
import { VolunteerForm, VolunteerFormValues } from './VolunteerForm'

export interface VolunteerListProps {
  volunteers?: Volunteer[]
}
export function VolunteerList({ volunteers: unsortedVolunteers }: VolunteerListProps) {
  const t = useT('routes.volunteers')
  const label = useT('domain.volunteer')
  const [sort, setSort] = useState<Sort>({ key: 'interestedIn', direction: 'asc' })
  const volunteers = sortedBy(unsortedVolunteers ?? [], volunteerSorter(sort.key), sort.direction === 'desc')

  return <ItemList
    items={volunteers ?? []}
    emptyText={t('noVolunteers')}
    columns="grid-cols-[1fr_1fr_max-content]"
  >
    <ItemList.SortableHeader currentSort={sort} onSort={setSort} columns={[
      { key: 'name', label: label('name') },
      { key: 'volunteeredIn', label: label('volunteeredIn') },
    ]} />
    {(volunteers ?? []).map(volunteer =>
      <VolunteerListRow key={volunteer._id} volunteer={volunteer}
      />,
    )}
  </ItemList>
}

function volunteerSorter(key: string) {
  switch (key) {
    default:
    case 'name':
      return (volunteer: Volunteer) => volunteer.name
    case 'volunteeredIn':
      return (volunteer: Volunteer) => {
        const sortedVolunteeredIn = sortedBy(
          volunteer.volunteeredIn,
          v => v.event.beginDate,
        )
        return sortedVolunteeredIn[0]?.event.beginDate
      }
  }
}

interface VolunteerListRowProps {
  volunteer: Volunteer
}

function VolunteerListRow({ volunteer }: VolunteerListRowProps) {
  const [showEditor, setShowEditor] = useState(false)
  const t = useT('')

  return <ItemList.Row
    expandableContent={<VolunteerRowEditor item={volunteer} />}
    isOpen={showEditor}
  >
    <span>{volunteer.name}</span>
    <VolunteeredIn volunteer={volunteer} />
    <div className="flex items-center gap-1">
      <DeleteVolunteerButton minimal volunteer={volunteer} />
      <Button
        requireRight="volunteers:modify"
        entityId={volunteer._id}
        minimal
        icon={<Edit />}
        aria-label={t('common.edit')}
        tooltip={t('common.edit')}
        color="primary"
        onClick={() => setShowEditor(!showEditor)}
        rightIcon={showEditor ? <ChevronUp /> : <ChevronDown />}
      />
    </div>
  </ItemList.Row>
}

function VolunteerRowEditor({ item }: { item: Volunteer }) {
  const [patchEventVolunteer] = usePatchVolunteer()

  const { formProps, state } = useAutosavingState<VolunteerFormValues, Partial<VolunteerFormValues>>(
    item,
    async ({ name }) => {
      await patchEventVolunteer({
        id: item._id,
        volunteer: { name },
      })
    },
    patchStrategy.partial,
  )

  return <VolunteerForm {...formProps} syncState={state} className="px-4" />
}
