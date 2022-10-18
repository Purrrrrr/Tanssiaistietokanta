import React from 'react'
import {DurationField} from 'components/widgets/DurationField'
import {formFor, MarkdownEditor} from 'libraries/forms2'
import {Dance} from 'types/Dance'
import {Flex} from 'components/Flex'

import './DanceEditor.sass'

interface DanceEditorProps {
  dance: Dance,
  onChange: (changed: Dance) => unknown
  onSubmit?: (d: Dance) => any
  bottomToolbar?: React.ReactNode
}

const {
  Form,
  Field,
  Input,
} = formFor<Dance>()

export function DanceEditor({dance, onChange, onSubmit, bottomToolbar} : DanceEditorProps) {
  return <Form value={dance} onChange={onChange} onSubmit={onSubmit}>
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
    {bottomToolbar}
  </Form>
}
