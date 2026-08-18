import { Volunteer } from 'types'

import { cleanMetadataValues } from 'backend'
import { usePatchVolunteer } from 'services/volunteers'

import { useMultipleSelection } from 'libraries/common/selection/useMultipleSelection'
import { patchStrategy, useAutosavingState } from 'libraries/forms'
import { ItemList2 } from 'libraries/ui'
import { Edit } from 'libraries/ui/icons'
import { VolunteeredIn } from 'components/volunteers/VolunteeredIn'
import { useT } from 'i18n'
import { sortedBy } from 'utils/sorted'

import { DeleteVolunteerButton } from './DeleteVolunteerButton'
import { MergeVolunteersButton } from './MergeVolunteersButton'
import { VolunteerForm, VolunteerFormValues } from './VolunteerForm'

export interface VolunteerListProps {
  volunteers?: Volunteer[]
}
export function VolunteerList({ volunteers = [] }: VolunteerListProps) {
  const t = useT('')
  const label = useT('domain.volunteer')
  const selector = useMultipleSelection(volunteers)

  return <>
    <div className="flex gap-2 justify-between items-center mb-2">
      <div>
        {volunteers?.length > 0 && t('routes.volunteers.Nvolunteers', { count: volunteers?.length })}
        {selector.selected.length > 0 && ', ' + t('routes.volunteers.selectedVolunteers', { count: selector.selected.length })}
      </div>
      {selector.selected.length >= 2 &&
        <MergeVolunteersButton selectedVolunteers={selector.selected} onMerge={selector.clearSelection} />
      }
    </div>
    <ItemList2
      id="volunteer-list"
      items={volunteers}
      emptyText={t('routes.volunteers.noVolunteers')}
      selection={selector}
      columns={[
        {
          label: label('name'),
          width: '1fr',
          content: 'name',
        }, {
          label: label('volunteeredIn'),
          width: '1fr',
          sortBy: {
            name: 'volunteeredIn',
            value: (volunteer: Volunteer) => {
              const sortedVolunteeredIn = sortedBy(
                volunteer.volunteeredIn,
                v => v.event.beginDate,
              )
              return sortedVolunteeredIn[0]?.event.beginDate
            },
          },
          content: volunteer => <VolunteeredIn volunteer={volunteer} />,
        },
      ]}
      actions={volunteer => <DeleteVolunteerButton minimal volunteer={volunteer} />}
      expandableContent={(volunteer) => <VolunteerRowEditor item={volunteer} />}
      expandButtonProps={volunteer => ({
        requireRight: 'volunteers:modify',
        entityId: volunteer._id,
        icon: <Edit />,
        ariaLabel: t('common.edit'),
        tooltip: t('common.edit'),
        color: 'primary',
      })}
    />
  </>
}

function VolunteerRowEditor({ item }: { item: Volunteer }) {
  const [patchEventVolunteer] = usePatchVolunteer()

  const { formProps, state } = useAutosavingState<VolunteerFormValues, Partial<VolunteerFormValues>>(
    cleanMetadataValues<Volunteer>(item),
    async ({ name }) => {
      await patchEventVolunteer({
        id: item._id,
        volunteer: { name },
      })
    },
    patchStrategy.partial,
  )

  return <VolunteerForm {...formProps} syncState={state} className="p-4" />
}
