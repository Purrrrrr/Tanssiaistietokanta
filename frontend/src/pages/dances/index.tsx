import { useSearchParams } from 'react-router-dom'

import { filterDances, useDances } from 'services/dances'

import { FormGroup, SearchBar } from 'libraries/ui'
import { CreateDanceButtons } from 'components/dance/CreateDanceButtons'
import { AnyCategory, anyCategory, DanceViewCategorySelector } from 'components/dance/DanceCategorySelector'
import { DanceList } from 'components/dance/DanceList'
import { LoadingState } from 'components/LoadingState'
import { PageTitle } from 'components/PageTitle'
import { RequirePermissions } from 'components/rights/RequirePermissions'
import { useT, useTranslation } from 'i18n'

function DancesPage() {
  const t = useT('pages.dances.danceList')
  const { search, setSearch, category, setCategory } = useDanceListState()
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
        <FormGroup inline label={useTranslation('domain.dance.category')} labelFor="dancecategory">
          <DanceViewCategorySelector id="dancecategory" value={category} onChange={setCategory} dances={dances} />
        </FormGroup>
      </div>
      <DanceList key={search} dances={filteredDances} />
    </RequirePermissions>
  </>
}

interface DanceListState {
  search: string
  category?: string | AnyCategory
}

function useDanceListState() {
  const [searchParams, setSearchParams] = useSearchParams()

  return {
    search: searchParams.get('search') ?? '',
    setSearch: (newSearch: string) => setSearchParams(p => {
      if (newSearch) p.set('search', newSearch)
      else p.delete('search')
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
