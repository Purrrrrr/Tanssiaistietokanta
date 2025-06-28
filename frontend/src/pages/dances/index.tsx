import { useSearchParams } from 'react-router-dom'

import { filterDances, useDances } from 'services/dances'

import {ModeButton, ModeSelector, SearchBar} from 'libraries/ui'
import { CreateDanceButtons } from 'components/dance/CreateDanceButtons'
import { DanceList, View } from 'components/dance/DanceList'
import {LoadingState} from 'components/LoadingState'
import {PageTitle} from 'components/PageTitle'
import {useT, useTranslation} from 'i18n'

function DancesPage() {
  const t = useT('pages.dances.danceList')
  const { search, setSearch, view, setView } = useDanceListState()
  const [dances, requestState] = useDances()

  const filteredDances = filterDances(dances, search)

  return <>
    <PageTitle>{t('pageTitle')}</PageTitle>
    <LoadingState {...requestState} />
    <div className="flex flex-wrap gap-4 mb-2.5">
      <SearchBar id="search-dances" value={search} onChange={setSearch} placeholder={useTranslation('common.search')} emptySearchText={useTranslation('common.emptySearch')}/>
      <div>
        <CreateDanceButtons danceCount={dances.length} />
      </div>
      <div className="grow" />
      <ModeSelector label={t('view')}>
        <ModeButton text={t('viewMode.tight')} selected={view === 'tight'} onClick={() => setView('tight')} />
        <ModeButton text={t('viewMode.extended')} selected={view === 'extended'} onClick={() => setView('extended')} />
      </ModeSelector>
    </div>
    <DanceList key={search} dances={filteredDances} view={view} />
  </>
}

interface DanceListState {
  search: string
  view: View
  category?: string
}
const views : View[] = ['tight', 'extended']

function useDanceListState() {
  const [searchParams, setSearchParams] = useSearchParams()
  const view = searchParams.get('view')

  return {
    search: searchParams.get('search') ?? '',
    setSearch: (newSearch: string) => setSearchParams(p => {
      if (newSearch) p.set('search', newSearch)
      else p.delete('search')
      return p
    }),
    view: views.find(w => w === view) ?? 'tight' as const,
    setView: (newView: View) => setSearchParams(p => {
      p.set('view', newView)
      return p
    }),
  } satisfies DanceListState & Record<string, unknown>
}

export default DancesPage
