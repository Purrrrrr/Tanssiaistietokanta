import { useCallback } from 'react'
import { useLazyQuery } from '@apollo/client'

import { entityUpdateHook, graphql, setupServiceUpdateFragment } from '../backend'

setupServiceUpdateFragment(
  'dancewiki',
  `fragment DanceWikiFragment on Wikipage {
    _id
    _fetchedAt
    name
    status
    categories
    formations
    instructions
  }`,
)

const nameSearchQuery = graphql(`
query searchDancewiki($search: String!) {
  searchWiki(search: $search) {
    name, spamScore
  }
}
`)

export function useSearchWikiTitles() {
  const [executeQuery, { data }] = useLazyQuery(nameSearchQuery)

  const doSearch = useCallback(async (search: string) => {
    const results = await executeQuery({ variables: { search } })
    return results.data?.searchWiki ?? []
  }, [executeQuery])

  return [doSearch, data?.searchWiki ?? []] as const
}

const fetchWikipageQuery = graphql(`
mutation fetchFromDanceWiki($name: String!) {
  fetchWikipage(name: $name) {
    _id
    _fetchedAt
    name
    status
    instructions
    spamScore
    categories
    formations
  }
}
`)

const useFetchQuery = entityUpdateHook('dancewiki', fetchWikipageQuery)

export function useFetchDanceFromWiki() {
  const [executeQuery, d] = useFetchQuery()

  return [
    (name: string) => executeQuery({ name }),
    d,
  ] as const
}
