import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateVolunteer, useVolunteers } from 'services/volunteers'

import { Card, H2, SearchBar } from 'libraries/ui'
import { LoadingState } from 'components/LoadingState'
import { Page } from 'components/Page'
import { useT, useTranslation } from 'i18n'

import { emptyVolunteerForm, VolunteerForm, VolunteerFormValues } from './-components/VolunteerForm'
import { VolunteerList } from './-components/VolunteerList'

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
  const { search, setSearch } = useVolunteerSearchParams()

  const [allVolunteers, requestState] = useVolunteers()
  const volunteers = allVolunteers
    .filter(volunteer => {
      if (search && !volunteer.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      return true
    })

  return <Page title={t('pageTitle')} background="volunteers">
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
    <VolunteerList volunteers={volunteers} />
    <LoadingState {...requestState} />
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
