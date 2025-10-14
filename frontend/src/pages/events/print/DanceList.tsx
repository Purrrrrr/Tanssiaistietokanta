import { useState } from 'react'

import { backendQueryHook, graphql } from 'backend'
import { useCallbackOnEventChanges } from 'services/events'

import { RadioGroup, Switch } from 'libraries/forms'
import { AutosizedSection, Button } from 'libraries/ui'
import { LinkToDanceWiki } from 'components/dance/DanceWikiPreview'
import { LoadingState } from 'components/LoadingState'
import { A4Page, PrintPageContainer, PrintViewToolbar } from 'components/print'
import { useT } from 'i18n'

import './DanceList.sass'

function DanceList({ eventId }) {
  const t = useT('pages.events.danceList')
  const { program, workshops, loadingState } = useBallProgram(eventId)
  const [style, setStyle] = useState('default')
  const [showLinks, setShowLinks] = useState(true)

  if (!program) return <LoadingState {...loadingState} />

  return <PrintPageContainer>
    <div className={`danceList ${style}`}>
      <PrintViewToolbar>
        <div className="flex gap-2 items-center">
          <Switch id="showlinks" value={showLinks} onChange={setShowLinks} label={t('showLinks')} />
          <RadioGroup
            id="style"
            inline
            options={[
              { value: 'default', label: t('style.default') },
              { value: 'three-columns', label: t('style.three-columns') },
              { value: 'large', label: t('style.large') },
            ]}
            value={style}
            onChange={setStyle}
          />
          <Button text={t('print')} onClick={() => window.print()} />
        </div>
      </PrintViewToolbar>
      <A4Page>
        <PrintFooterContainer footer={<Footer workshops={workshops.filter(w => w.abbreviation)} />}>
          {program.danceSets.map(
            ({ title, program }, key) => {
              return <AutosizedSection key={key} className="text-center section">
                <h2 className="mb-4 text-3xl font-bold">{title}</h2>
                {program
                  .map(row => row.item)
                  .filter(item => item.__typename !== 'EventProgram' || item.showInLists)
                  .map((item, i) =>
                    <ProgramItem key={i} item={item} showLinks={showLinks} />,
                  )}
              </AutosizedSection>
            },
          )}
        </PrintFooterContainer>
      </A4Page>
    </div>
  </PrintPageContainer>
}

function Footer({ workshops }) {
  const t = useT('pages.events.danceList')
  if (!workshops.length) return <>{t('emptyLinesAreRequestedDances')}</>
  return <>
    {t('workshopNameIsInParenthesis')}
    {': '}
    {workshops.map(({ abbreviation, name }) => `${abbreviation}=${name}`).join(', ')}
    {'. '}
    {t('emptyLinesAreRequestedDances')}
  </>
}

function ProgramItem({ item, showLinks }: { item: BallProgramItem, showLinks: boolean }) {
  switch (item.__typename) {
    case 'RequestedDance':
      return <p><RequestedDance /></p>
    case 'EventProgram':
      return <p>{item.name}</p>
    case 'Dance': {
      const teachedIn = item.teachedIn
        .map(({ workshop, instances }) => instances
          ? `${workshop.abbreviation} ${instances.map(i => i.abbreviation).join('/')}`
          : workshop.abbreviation,
        )
        .filter(Boolean)
        .join(', ')

      return <p>
        {showLinks && item.wikipageName
          ? <LinkToDanceWiki page={item.wikipageName}>{item.name}</LinkToDanceWiki>
          : item.name}
        {teachedIn && ` (${teachedIn})`}
      </p>
    }
  }
}

const RequestedDance = () => <>_________________________</>

function PrintFooterContainer({ children, footer }) {
  return <>
    <table style={{ width: '100%' }}>
      <thead><tr><td></td></tr></thead>
      <tfoot><tr><td>{footer}</td></tr></tfoot>
      <tbody><tr><td>{children}</td></tr></tbody>
    </table>
    <footer>{footer}</footer>
  </>
}

const useDanceList = backendQueryHook(graphql(`
query getDanceList($eventId: ID!) {
  event(id: $eventId) {
    _id
    _versionId
    program {
      danceSets {
        title
        program {
          item {
            __typename
            ... on ProgramItem {
              name
            }
            ... on Dance {
              teachedIn(eventId: $eventId) {
                workshop {
                  name, abbreviation
                }
                instances { abbreviation }
              }
              wikipageName
            }
            ... on EventProgram {
              showInLists
            }
          }
        }
      }
    }
    workshops {
      name, abbreviation
    }
  }
}`), ({ refetch, variables }) => {
  if (variables === undefined) throw new Error('Unknown event id')
  useCallbackOnEventChanges(variables.eventId, refetch)
})

function useBallProgram(eventId: string) {
  const { data, ...loadingState } = useDanceList({ eventId })
  const { program = null, workshops = [] } = data?.event ?? {}
  return { program, workshops, loadingState }
}

type BallProgram = ReturnType<typeof useBallProgram>
type BallProgramItem = Exclude<BallProgram['program'], null>['danceSets'][number]['program'][number]['item']

export default DanceList
