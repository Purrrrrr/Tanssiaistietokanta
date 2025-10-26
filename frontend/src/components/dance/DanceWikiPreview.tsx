import { useState } from 'react'
import { ChevronDown, ChevronUp, Link as LinkIcon } from '@blueprintjs/icons'

import { Dance } from 'types'

import { useFetchDanceFromWiki } from 'services/dancewiki'

import { useFormatDateTime } from 'libraries/i18n/dateTime'
import {Button, Collapse, RegularLink} from 'libraries/ui'
import Markdown from 'libraries/ui/Markdown'
import { useT } from 'i18n'

interface DanceWikiPreviewProps {
  dance: Dance
}

const danceWikiUrl = 'https://tanssi.dy.fi/'

export default function DanceWikiPreview({ dance }: DanceWikiPreviewProps) {
  const t = useT('components.danceWikiPreview')
  const [open, setOpen] = useState(false)
  const formatDateTime = useFormatDateTime()

  const { wikipageName, wikipage } = dance
  if (!wikipageName || !wikipage) return null
  const hasInstructions = wikipage._fetchedAt && wikipage.instructions

  return <div className="p-2 mb-5 rounded-sm bg-gray-200/80">
    <div className="flex gap-10 items-center">
      <div>
        {t('danceInDanceWiki')}:
        <LinkToDanceWiki className="ms-2" page={wikipageName} />
      </div>
      <div className="flex gap-2 items-center">
        {wikipage._fetchedAt && t('danceFetched', { date: formatDateTime(wikipage._fetchedAt) })}
        <FetchWikipageButton page={wikipageName} />
        {hasInstructions && <Button
          color="primary"
          text={t('openInstructions')}
          onClick={() => setOpen(!open)}
          rightIcon={open ? <ChevronUp/> : <ChevronDown />}
        />}
      </div>

    </div>
    {hasInstructions && <Collapse isOpen={open}>

      <div className="overflow-auto p-2 mt-2 bg-white border-gray-300 border-1 max-h-120">
        <Markdown children={dance.wikipage?.instructions ?? ''} options={options} />
      </div>
    </Collapse>
    }
  </div>
}

const options = {
  overrides: {
    a: WikiLink,
  },
}

export function LinkToDanceWiki({ className, page, children }: {
  className?: string
  page: string
  children?: React.ReactNode
}) {
  return <RegularLink
    className={className}
    target="_blank"
    href={`${danceWikiUrl}${page.replaceAll(' ', '_')}`}
  >
    {children ?? <><LinkIcon /> {page}</>}
  </RegularLink>
}

function FetchWikipageButton({ page }: { page: string}) {
  const t = useT('components.danceWikiPreview')
  const [fetch, {loading}] = useFetchDanceFromWiki()

  return <Button
    disabled={loading}
    text={t(loading ? 'fetching' : 'fetchInstructions')}
    onClick={() => fetch(page)}
  />
}

export function WikiLink({ href, ...props }: React.ComponentProps<'a'>) {
  const isInternalWikiLink = href && !href?.match(/^(\w+:\/\/|#)/)
  const link = isInternalWikiLink
    ? `${danceWikiUrl}${href}`
    : href

  return <RegularLink {...props} href={link} target="_blank" />
}
