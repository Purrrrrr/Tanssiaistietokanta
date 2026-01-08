import { useSearchParams } from 'react-router-dom'

import { filterDances, useDances } from 'services/dances'

import { FormGroup, ModeButton, ModeSelector, SearchBar } from 'libraries/ui'
import { CreateDanceButtons } from 'components/dance/CreateDanceButtons'
import { AnyCategory, anyCategory, DanceViewCategorySelector } from 'components/dance/DanceCategorySelector'
import { DanceList, View } from 'components/dance/DanceList'
import { LoadingState } from 'components/LoadingState'
import { PageTitle } from 'components/PageTitle'
import { RequirePermissions } from 'components/rights/RequirePermissions'
import { useT, useTranslation } from 'i18n'

function DancesPage() {
  const t = useT('pages.dances.danceList')
  const { search, setSearch, category, setCategory, view, setView } = useDanceListState()
  const [dances, requestState] = useDances()

  const filteredDances = filterDances(dances, search, category !== anyCategory ? category : undefined)

  return <>
    <PageTitle>{t('pageTitle')}</PageTitle>
    <RequirePermissions requireRight="dances:read">
      <LoadingState {...requestState} />
      <div className="flex flex-wrap gap-2 mb-2.5">
        <SearchBar id="search-dances" value={search} onChange={setSearch} placeholder={useTranslation('common.search')} emptySearchText={useTranslation('common.emptySearch')} />
        <RequirePermissions requireRight="dances:create">
          <div>
            <CreateDanceButtons danceCount={dances.length} />
          </div>
        </RequirePermissions>
        <div className="grow" />
        <FormGroup inline label={useTranslation('domain.dance.category')} id="dc">
          <DanceViewCategorySelector id="dc" value={category} onChange={setCategory} dances={dances} />
        </FormGroup>
        <ModeSelector label={t('view')}>
          <ModeButton text={t('viewMode.tight')} selected={view === 'tight'} onClick={() => setView('tight')} />
          <ModeButton text={t('viewMode.extended')} selected={view === 'extended'} onClick={() => setView('extended')} />
        </ModeSelector>
      </div>
      <DanceList key={search} dances={filteredDances} view={view} />
    </RequirePermissions>
  </>
}

interface DanceListState {
  search: string
  view: View
  category?: string | AnyCategory
}
const views: View[] = ['tight', 'extended']

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
    category: searchParams.has('category') ? (searchParams.get('category') ?? '') : anyCategory,
    setCategory: (newCategory: string | AnyCategory) => setSearchParams(p => {
      if (newCategory !== anyCategory) p.set('category', newCategory)
      else p.delete('category')
      return p
    }),
  } satisfies DanceListState & Record<string, unknown>
}

export default DancesPage
