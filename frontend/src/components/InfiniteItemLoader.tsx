import {useState} from 'react'
import InfiniteScroll from 'react-infinite-scroller'

export function InfiniteItemLoader<T>({ items, children } : { items: T[], children: (items: T[]) => React.ReactNode }) {
  const [limit, setLimit] = useState(5)
  const canShowMore = items.length > limit
  if (!items.length) return null

  return <InfiniteScroll hasMore={canShowMore} loadMore={() => setLimit(limit + 5)}>
    {children(items.slice(0, limit))}
  </InfiniteScroll>
}
