import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateVolunteer, useVolunteers } from 'services/volunteers'

import { searchList } from 'libraries/common/listSearch'
import { Button, Card, Collapse, DialogCloseButton, H2, SearchBar } from 'libraries/ui'
import { LoadingState } from 'components/LoadingState'
import { Page, Toolbar } from 'components/Page'
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
  const [createOpen, setCreateOpen] = useState(false)

  const [allVolunteers, requestState] = useVolunteers()
  const volunteers = searchList(allVolunteers, search, 'name', volunteer => volunteer.volunteeredIn.map(e => e.event.name).join(' '))

  return <Page
    title={t('pageTitle')}
    background="volunteers"
    toolbar={
      <Toolbar>
        <SearchBar
          id="search-volunteers"
          value={search}
          onChange={setSearch}
          placeholder={useTranslation('common.search')}
          emptySearchText={useTranslation('common.emptySearch')}
        />
        <Button
          text={t('addVolunteer')}
          onClick={() => setCreateOpen(!createOpen)}
          requireRight="volunteers:create"
        />
      </Toolbar>
    }
  >
    <Collapse isOpen={createOpen}>
      <CreateVolunteerForm onClose={() => setCreateOpen(false)} />
    </Collapse>
    <VolunteerList volunteers={volunteers} />
    <LoadingState {...requestState} />
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

function CreateVolunteerForm({ onClose }: { onClose: () => void }) {
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
    onClose()
  }

  return <Card className="relative">
    <H2>{t('addVolunteer')}</H2>
    <DialogCloseButton
      className="absolute top-3 right-3"
      aria-label={useTranslation('common.close')}
      onClick={() => { setFormData(emptyVolunteerForm); onClose() }}
    />
    <VolunteerForm
      value={formData}
      onChange={setFormData}
      onSubmit={handleSubmit}
      submitText={t('addVolunteer')}
    />
  </Card>
}
