import { createFileRoute } from '@tanstack/react-router'

import { filterDances, useDances } from 'services/dances'

import { RequirePermissions } from 'libraries/access-control'
import { FormGroup, SearchBar } from 'libraries/ui'
import { CreateDanceButtons } from 'components/dance/CreateDanceButtons'
import { AnyCategory, anyCategory, DanceViewCategorySelector } from 'components/dance/DanceCategorySelector'
import { DanceList } from 'components/dance/DanceList'
import { LoadingState } from 'components/LoadingState'
import { Page } from 'components/Page'
import { useT, useTranslation } from 'i18n'

interface DanceSearchParams {
  search?: string
  category?: string | AnyCategory
}

export const Route = createFileRoute('/dances/')({
  component: DancesPage,
  staticData: {
    requireRights: 'dances:list',
    usesRights: ['dances:modify', 'dances:create', 'dances:delete'],
  },
  validateSearch: (search: Record<string, unknown>): DanceSearchParams => {
    return {
      search: typeof search.search === 'string' ? search.search : '',
      category: typeof search.category === 'string' ? search.category : anyCategory,
    }
  },
})

function DancesPage() {
  const t = useT('pages.dances.danceList')
  const { search, setSearch, category, setCategory } = useDanceListState()
  const [dances, requestState] = useDances()

  const filteredDances = filterDances(dances, search, category !== anyCategory ? category : undefined)

  return <Page
    title={t('pageTitle')}
    toolbar={
      <div className="flex flex-wrap gap-2">
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
    }
  >
    <LoadingState {...requestState} />
    <DanceList key={search} dances={filteredDances} />
  </Page>
}

interface DanceListState {
  search: string
  category?: string | AnyCategory
}

function useDanceListState() {
  const { search = '', category = anyCategory } = Route.useSearch()
  const navigate = Route.useNavigate()

  return {
    search,
    setSearch: (newSearch: string) => navigate({
      to: '.',
      search: { search: newSearch, category },
    }),
    category,
    setCategory: (newCategory: string | AnyCategory) => navigate({
      to: '.',
      search: { category: newCategory, search },
    }),
  } satisfies DanceListState & Record<string, unknown>
}
