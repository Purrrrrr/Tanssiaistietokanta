import {useState} from 'react'

import {backendQueryHook, graphql} from 'backend'
import {useCallbackOnEventChanges} from 'services/events'

import {RadioGroup} from 'libraries/forms'
import {AutosizedSection, Button} from 'libraries/ui'
import {LoadingState} from 'components/LoadingState'
import PrintViewToolbar from 'components/widgets/PrintViewToolbar'
import {useT} from 'i18n'

import './DanceList.sass'

function DanceList({eventId}) {
  const t = useT('pages.events.danceList')
  const {program, workshops, loadingState} = useBallProgram(eventId)
  const [style, setStyle] = useState('default')

  if (!program) return <LoadingState {...loadingState} />

  return <div className={`danceList ${style}`}>
    <PrintViewToolbar>
      <RadioGroup
        id="style"
        inline
        options={[
          {value: 'default', label: 'Oletus'},
          {value: 'three-columns', label: 'Rinnakkaiset setit'},
          {value: 'large', label: 'Yksi setti per arkki'},
        ]}
        value={style}
        onChange={setStyle}
      />
      <Button text={t('print')} onClick={() => window.print()} />
    </PrintViewToolbar>
    <main>
      <PrintFooterContainer footer={<Footer workshops={workshops.filter(w => w.abbreviation)} />}>
        {program.danceSets.map(
          ({title, program}, key) => {
            return <AutosizedSection key={key} className="section">
              <h2 className="font-bold text-lg">{title}</h2>
              {program
                .map(row => row.item)
                .filter(item => item.__typename !== 'EventProgram' || item.showInLists)
                .map((item, i) =>
                  <ProgramItem key={i} item={item} />
                )}
            </AutosizedSection>
          }
        )}
      </PrintFooterContainer>
    </main>
  </div>
}

function Footer({workshops}) {
  const t = useT('pages.events.danceList')
  if (!workshops.length) return <>{t('emptyLinesAreRequestedDances')}</>
  return <>
    {t('workshopNameIsInParenthesis')}
    {': '}
    {workshops.map(({abbreviation, name}) => `${abbreviation}=${name}`).join(', ')}
    {'. '}
    {t('emptyLinesAreRequestedDances')}
  </>
}

function ProgramItem({item}) {
  const teachedIn = (item.teachedIn ?? [])
    .map(({workshop, instances}) => instances
      ? `${workshop.abbreviation} ${instances.map(i => i.abbreviation).join('/')}`
      : workshop.abbreviation
    )
    .filter(Boolean)
    .join(', ')
  return <p>
    {item.name ?? <RequestedDance />}
    {teachedIn && ` (${teachedIn})`}
  </p>
}

const RequestedDance = () => <>_________________________</>

function PrintFooterContainer({children, footer}) {
  return <>
    <table style={{width: '100%'}}>
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
}`), ({refetch, variables}) => {
  if (variables === undefined) throw new Error('Unknown event id')
  useCallbackOnEventChanges(variables.eventId, refetch)
})

function useBallProgram(eventId: string) {
  const {data, ...loadingState} = useDanceList({eventId})
  const {program = null, workshops = []} = data?.event ?? {}
  return {program, workshops, loadingState}
}

export default DanceList
