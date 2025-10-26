import { useId } from 'react'

import { DanceWikiSearchResult } from 'types'

import { useSearchWikiTitles } from 'services/dancewiki'

import { AutocompleteInput } from 'libraries/formsV2/components/inputs'
import {useT} from 'i18n'


interface WikipageSelectorProps {
  value: string | null
  onChange: (value: string | null) => unknown
  readOnly?: boolean
  emptyText?: string
  placeholder?: string
  possibleName?: string
}

const commonWords = [
  'the', 'a', 'an', 'of'
]

export function WikipageSelector({ value, onChange, readOnly, placeholder, possibleName }: WikipageSelectorProps) {
  const t = useT('components.wikipageSelector')
  const id = useId()
  const [search] = useSearchWikiTitles()

  const getItems = async (searchStr: string) => {
    const pages = await search(searchStr)
    const spamTreshold = 1.5
    const suggestionTerms = possibleName
      ?.toLowerCase()
      ?.split(/ +/)
      ?.filter(term => !commonWords.includes(term))
      ?.map(term => ` ${term} `)

    const isTermInPage = (page: DanceWikiSearchResult) => {
      const name = ` ${page.name.toLowerCase()} `
      return (term: string) => name.includes(term)
    }
    const groups = Object.groupBy(pages, page => {
      if (page.spamScore < spamTreshold) {
        const isSuggested = suggestionTerms?.some(isTermInPage(page))
        return isSuggested ? 'suggestion' : 'regular'
      }
      return 'spam'
    })

    return {
      categories: [
        {
          title: t('suggestions'),
          items: (groups.suggestion ?? [])
            .sort((a, b) => {
              const suggestioCountA = suggestionTerms?.filter(isTermInPage(a))?.length ?? 0
              const suggestioCountB = suggestionTerms?.filter(isTermInPage(b))?.length ?? 0
              return suggestioCountB - suggestioCountA
            })
        },
        {
          title: t('wikipage'),
          items: groups.regular ?? []
        },
        {
          title: t('spam'),
          items: groups.spam ?? []
        },
      ],
    }
  }

  return <AutocompleteInput<DanceWikiSearchResult | null>
    placeholder={placeholder ?? t('searchPage')}
    id={id}
    items={getItems}
    value={value ? { name: value, spamScore: 0 } : null}
    onChange={item => onChange(item?.name ?? null)}
    readOnly={readOnly}
    itemToString={page => page?.name ?? ''}
  />
}
