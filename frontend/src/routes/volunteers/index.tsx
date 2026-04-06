import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { Volunteer } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateVolunteer, usePatchVolunteer, useVolunteers } from 'services/volunteers'

import { patchStrategy, useAutosavingState } from 'libraries/forms'
import { Button, Card, H2, SearchBar } from 'libraries/ui'
import { ChevronDown, ChevronUp, Edit } from 'libraries/ui/icons'
import { ItemList, Sort } from 'libraries/ui/ItemList'
import { Page } from 'components/Page'
import { VolunteeredIn } from 'components/volunteers/VolunteeredIn'
import { useT, useTranslation } from 'i18n'
import { sortedBy } from 'utils/sorted'

import { DeleteVolunteerButton } from './-components/DeleteVolunteerButton'
import { emptyVolunteerForm, VolunteerForm, VolunteerFormValues } from './-components/VolunteerForm'

interface VolunteerSearchParams {
  search?: string
}

export const Route = createFileRoute('/volunteers/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): VolunteerSearchParams => {
    return {
      search: typeof search.search === 'string' ? search.search : '',
    }
  },
  staticData: {
    breadcrumb: 'routes.volunteers.pageTitle',
  },
})

function RouteComponent() {
  const t = useT('routes.volunteers')
  const label = useT('domain.volunteer')
  const { search, setSearch } = useVolunteerSearchParams()
  const [sort, setSort] = useState<Sort>({ key: 'interestedIn', direction: 'asc' })

  const [unsortedVolunteers] = useVolunteers()
  console.log('unsortedVolunteers', unsortedVolunteers)
  const volunteers = sortedBy(unsortedVolunteers ?? [], volunteerSorter(sort.key), sort.direction === 'desc')
    .filter(volunteer => {
      if (search && !volunteer.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      return true
    })

  return <Page title={t('pageTitle')}>
    <div className="flex gap-4 flex-wrap items-center justify-between mb- mb-4">
      <div className="flex gap-4">
        <SearchBar
          id="search-volunteers"
          value={search}
          onChange={setSearch}
          placeholder={useTranslation('common.search')}
          emptySearchText={useTranslation('common.emptySearch')}
        />
      </div>
    </div>
    <p>{volunteers?.length > 0 && t('Nvolunteers', { count: volunteers?.length })}</p>
    <ItemList
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
    <CreateVolunteerForm />
  </Page>
}

function useVolunteerSearchParams() {
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
  }
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

function CreateVolunteerForm() {
  const [formData, setFormData] = useState<VolunteerFormValues>(emptyVolunteerForm)
  const [createVolunteer] = useCreateVolunteer({ refetchQueries: ['getVolunteers'] })
  const t = useT('routes.volunteers')

  const handleSubmit = async ({ name }: VolunteerFormValues) => {
    await addGlobalLoadingAnimation(createVolunteer({
      volunteer: {
        name,
      },
    }))
    setFormData(emptyVolunteerForm)
  }

  return <Card>
    <H2>{t('addVolunteer')}</H2>
    <VolunteerForm
      value={formData}
      onChange={setFormData}
      onSubmit={handleSubmit}
      submitText={t('addVolunteer')}
    />
  </Card>
}
