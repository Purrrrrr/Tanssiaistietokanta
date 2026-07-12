import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { addGlobalLoadingAnimation } from 'backend'
import { useBallrooms, useCreateBallroom } from 'services/ballrooms'

import { searchList } from 'libraries/common/listSearch'
import { Button, Card, Collapse, DialogCloseButton, H2, SearchBar } from 'libraries/ui'
import { LoadingState } from 'components/LoadingState'
import { Page, Toolbar } from 'components/Page'
import { useT, useTranslation } from 'i18n'

import { BallroomForm } from './-components/BallroomForm'
import { BallroomFormValues, emptyBallroomForm } from './-components/ballroomFormValues'
import { BallroomList } from './-components/BallroomList'

interface BallroomSearchParams {
  search?: string
}

export const Route = createFileRoute('/ballrooms/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): BallroomSearchParams => {
    return {
      search: typeof search.search === 'string' ? search.search : '',
    }
  },
  staticData: {
    breadcrumb: 'routes.ballrooms.pageTitle',
  },
})

function RouteComponent() {
  const t = useT('routes.ballrooms')
  const { search, setSearch } = useBallroomSearchParams()
  const [createOpen, setCreateOpen] = useState(false)

  const [allBallrooms, requestState] = useBallrooms()
  const ballrooms = searchList(allBallrooms, search, 'venueName', ballroom => ballroom.roomName ?? '')

  return <Page
    title={t('pageTitle')}
    toolbar={
      <Toolbar>
        <SearchBar
          id="search-ballrooms"
          value={search}
          onChange={setSearch}
          placeholder={useTranslation('common.search')}
          emptySearchText={useTranslation('common.emptySearch')}
        />
        <Button
          requireRight="ballrooms:create"
          text={t('addBallroom')}
          onClick={() => setCreateOpen(!createOpen)}
        />
      </Toolbar>
    }
    background="ball">
    <Collapse isOpen={createOpen}>
      <CreateBallroomForm onClose={() => setCreateOpen(false)} />
    </Collapse>
    <BallroomList ballrooms={ballrooms} />
    <LoadingState {...requestState} />
  </Page>
}

function useBallroomSearchParams() {
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

function CreateBallroomForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<BallroomFormValues>(emptyBallroomForm)
  const [createBallroom] = useCreateBallroom({ refetchQueries: ['getBallrooms'] })
  const t = useT('routes.ballrooms')

  const handleSubmit = async ({ venueName, roomName, map }: BallroomFormValues) => {
    await addGlobalLoadingAnimation(createBallroom({
      ballroom: {
        venueName,
        roomName: roomName?.trim() ? roomName : undefined,
        map,
      },
    }))
    setFormData(emptyBallroomForm)
    onClose()
  }

  return <Card className="relative">
    <H2>{t('addBallroom')}</H2>
    <DialogCloseButton
      className="absolute top-3 right-3"
      aria-label={useTranslation('common.close')}
      onClick={() => { setFormData(emptyBallroomForm); onClose() }}
    />
    <BallroomForm
      value={formData}
      onChange={setFormData}
      onSubmit={handleSubmit}
      submitText={t('addBallroom')}
    />
  </Card>
}
