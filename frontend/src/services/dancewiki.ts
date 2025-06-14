import { useCallback } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'

import { graphql } from '../backend'

const nameSearchQuery = graphql(`
query searchDancewiki($search: String!, $maxSpamScore: Float) {
  searchWikiTitles(search: $search, maxSpamScore: $maxSpamScore)
}
`)

export function useSearchWikiTitles() {
  const [executeQuery, { data }] = useLazyQuery(nameSearchQuery)

  const doSearch = useCallback(async (search: string) => {
    const results = await executeQuery({ variables: { search, maxSpamScore: 3 } })
    return results.data?.searchWikiTitles ?? []
  }, [executeQuery])

  return [doSearch, data?.searchWikiTitles ?? []] as const
}

const fetchWikipageQuery = graphql(`
mutation fetchFromDanceWiki($name: String!) {
  fetchWikipage(name: $name) {
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

export function useFetchDanceFromWiki() {
  const [executeQuery, { data }] = useMutation(fetchWikipageQuery)

  // const doSearch = useCallback(async (search: string) => {
  //   const results = await executeQuery({ variables: { search, maxSpamScore: 3 } })
  //   return results.data?.searchWikiTitles ?? []
  // }, [executeQuery])
  //
  // return [doSearch, data?.searchWikiTitles ?? []] as const
}
