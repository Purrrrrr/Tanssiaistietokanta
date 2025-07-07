import { useState } from 'react'
import { ChevronDown, ChevronUp, Link as LinkIcon } from '@blueprintjs/icons'

import { Dance } from 'types'

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

  return <div className="mb-5 p-2 bg-gray-200/80 rounded-sm">
    <div className="flex items-center gap-10">
      <div>
        {t('danceInDanceWiki')}:
        <RegularLink
          className="ms-2"
          target="_blank"
          href={`https://tanssi.dy.fi/${wikipageName.replaceAll(' ', '_')}`}
        >
          <LinkIcon /> {dance.wikipageName}
        </RegularLink>
      </div>
      <div className="flex items-center gap-2">
        {wikipage._fetchedAt && t('danceFetched', { date: formatDateTime(wikipage._fetchedAt) })}
        {hasInstructions && <Button
          color="primary"
          text={t('openInstructions')}
          onClick={() => setOpen(!open)}
          rightIcon={open ? <ChevronUp/> : <ChevronDown />}
        />}
      </div>

    </div>
    {hasInstructions && <Collapse isOpen={open}>

      <div className="mt-2 p-2 bg-white border-1 border-gray-300 max-h-120 overflow-auto">
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

export function LinkToDanceWiki({ page }: { page: string }) {
  return <RegularLink
    target="_blank"
    href={`${danceWikiUrl}${page.replaceAll(' ', '_')}`}
  >
    <LinkIcon /> {page}
  </RegularLink>
}

export function WikiLink({ href, ...props }: React.ComponentProps<'a'>) {
  const isInternalWikiLink = href && !href?.match(/^(\w+:\/\/|#)/)
  const link = isInternalWikiLink
    ? `${danceWikiUrl}${href}`
    : href

  return <RegularLink {...props} href={link} target="_blank" />
}

function toWikiUrl(href?: string) {

}
