import React, {useCallback} from 'react'
import {Link, useNavigate} from 'react-router-dom'

import { useDeleteDance, usePatchDance } from 'services/dances'

import {formFor, MarkdownEditor, MenuButton, patchStrategy, SelectorMenu, SyncStatus, useAutosavingState} from 'libraries/forms'
import {Flex, H2, Icon} from 'libraries/ui'
import {DanceDataImportButton} from 'components/DanceDataImportDialog'
import {useGlobalLoadingAnimation} from 'components/LoadingState'
import {DeleteButton} from 'components/widgets/DeleteButton'
import {DurationField} from 'components/widgets/DurationField'
import {LinkMenuItem} from 'components/widgets/LinkMenuItem'

import {Dance, DanceWithEvents} from 'types'

interface DanceListItemProps {
  dance: DanceWithEvents
  onDelete?: () => unknown
  showLink?: boolean
  titleComponent?: React.JSXElementConstructor<{className: string, children: React.ReactNode}> | 'h1'
}

const {
  Form,
  Field,
  Input,
} = formFor<Dance>()

export function DanceEditor({dance, onDelete, showLink, titleComponent: Title = H2} : DanceListItemProps) {
  const addLoadingAnimation = useGlobalLoadingAnimation()
  const [deleteDance] = useDeleteDance()
  const [modifyDance] = usePatchDance()
  const patchDance = useCallback(
    (patches : Partial<DanceWithEvents>) =>
      modifyDance({id: dance._id, dance: patches})
    ,
    [modifyDance, dance._id]
  )
  const handleDelete = () => {
    addLoadingAnimation(deleteDance({id: dance._id}))
    onDelete && onDelete()
  }

  const {formProps, state} = useAutosavingState<Dance, Partial<Dance>>(dance, patchDance, patchStrategy.partial)
  return <>
    <Flex spaced alignItems="center">
      <Title className="flex-fill">
        {dance.name}
        <SyncStatus style={{marginLeft: '1ch', top: '3px'}} className="flex-fill" state={state} />
      </Title>
      {showLink && <Link to={`/dances/${dance._id}`}><Icon icon="link"/>Linkki tähän tanssiin</Link>}
      <DanceIsUsedIn events={dance.events} />
      <div>
        <DeleteButton onDelete={handleDelete}
          disabled={dance.events.length > 0}
          text="Poista tanssi"
          confirmText="Haluatko varmasti poistaa tämän tanssin?"
        />
        <DanceDataImportButton text="Hae tietoja tanssiwikistä" dance={formProps.value} onImport={formProps.onChange} />
      </div>
    </Flex>
    <Form {...formProps}>
      <Flex spaced wrap className="danceEditor">
        <div style={{flexGrow: 1, flexBasis: 300}}>
          <Input label="Nimi" path="name" />
          <Input label="Kategoria" path="category" />
          <Field label="Kesto" path="duration" component={DurationField} />
          <Input label="Alkusoitto" path="prelude" />
          <Input label="Tanssikuvio" path="formation" />
          <Input label="Huomautuksia" path="remarks" />
        </div>
        <div style={{flexGrow: 2, flexBasis: 500}}>
          <Field label="Kuvaus" path="description" component={MarkdownEditor} />
          <Field label="Tanssiohjeet" path="instructions" component={MarkdownEditor} />
        </div>
      </Flex>
    </Form>
  </>
}


function DanceIsUsedIn({events}: Pick<DanceWithEvents, 'events'>) {
  const navigate = useNavigate()
  if (events.length === 0) return null

  const menu = <SelectorMenu
    items={events}
    onSelect={(event) => { navigate(`/events/${event._id}`) }}
    getItemText={event => event.name}
    itemRenderer={(name, event, rest) =>
      <LinkMenuItem key={event._id} icon="link" href={`/events/${event._id}`} text={name} active={rest.modifiers.active}/>
    }
  />

  return <div>
    <MenuButton
      alwaysEnabled
      menu={menu}
      text={`Käytössä ${events.length} tapahtumassa`}
      buttonProps={{minimal: true, rightIcon: 'caret-down'}}
    />
  </div>
}
