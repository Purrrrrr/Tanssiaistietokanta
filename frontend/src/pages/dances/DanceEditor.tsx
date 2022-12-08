import React, {useCallback} from 'react'
import {Link} from 'react-router-dom'

import { useDeleteDance, usePatchDance } from 'services/dances'

import {formFor, MarkdownEditor, patchStrategy, SyncStatus, useAutosavingState} from 'libraries/forms'
import {H2, Icon} from 'libraries/ui'
import {DanceDataImportButton} from 'components/DanceDataImportDialog'
import {Flex} from 'components/Flex'
import {DeleteButton} from 'components/widgets/DeleteButton'
import {DurationField} from 'components/widgets/DurationField'

import {Dance} from 'types'

interface DanceListItemProps {
  dance: Dance
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
  const [deleteDance] = useDeleteDance()
  const [modifyDance] = usePatchDance()
  const patchDance = useCallback(
    (patches : Partial<Dance>) => {
      modifyDance({id: dance._id, dance: patches})
    },
    [modifyDance, dance._id]
  )
  const handleDelete = () => {
    deleteDance({id: dance._id})
    onDelete && onDelete()
  }

  const {formProps, state} = useAutosavingState<Dance, Partial<Dance>>(dance, patchDance, patchStrategy.partial)
  return <>
    <Flex spaced alignItems="center">
      <Title className="flex-fill">
        {dance.name}
        <SyncStatus style={{marginLeft: '1ch', top: '3px'}} className="flex-fill" state={state} />
      </Title>
      {showLink && <Link to={dance._id}><Icon icon="link"/>Linkki tähän tanssiin</Link>}
      <div>
        <DeleteButton onDelete={handleDelete}
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
