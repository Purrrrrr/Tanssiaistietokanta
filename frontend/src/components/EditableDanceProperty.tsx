import React from 'react';
import {PATCH_DANCE, WritableDanceProperty, dancePropertyLabels} from "services/dances";
import { useMutation } from 'services/Apollo';
import {ClickToEdit} from "libraries/forms";
import {SimpleMarkdownEditor} from 'components/MarkdownEditor';

import './EditableDanceProperty.sass';

type ValidProperty = Exclude<WritableDanceProperty, 'duration' | 'instructions'>

interface EditableDancePropertyProps {
  dance: any,
  property: ValidProperty,
  addText: string,
  type?: 'multiline' | 'markdown'
}

export function EditableDanceProperty({dance, property, addText, ...props} : EditableDancePropertyProps) {
  const [patch, state] = useMutation(PATCH_DANCE);

  const onChange = (value) => {
    patch({
      variables: {
        id: dance._id,
        dance: {[property]: value}
      }
    })
  }

  if (state.loading) return <>...</>;

  const editorType = props["type"]

  if (editorType === 'markdown') {
    return <SimpleMarkdownEditor value={dance[property]} onChange={onChange} />
  }

  return <ClickToEdit label={dancePropertyLabels[property]} labelStyle="hidden" className="editableDanceProperty"
    editorComponent={editorType === 'multiline' ? ClickToEdit.MultilineEditor : ClickToEdit.TextEditor}
    value={dance[property]} onChange={onChange}
    valueFormatter={value => value || <span className="addEntry">{addText}</span>}
  />;
}

