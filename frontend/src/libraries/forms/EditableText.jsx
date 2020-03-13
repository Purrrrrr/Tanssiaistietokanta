import React  from 'react';
import {EditableText as BlueprintEditabletext} from "@blueprintjs/core";
import {ErrorMessage} from "./validation";
import {useClosableEditor} from "./hooks/useClosableEditor";

export function EditableText({value: maybeValue, onChange, defaultValue = "", multiline, ...validationSchema}) {
  const {isOpen, onOpen, error, ...props} = useClosableEditor(
    maybeValue ?? defaultValue, onChange, {validationSchema}
  );

  return <>
    <BlueprintEditabletext {...props} isEditing={isOpen} onEdit={onOpen}
      placeholder="<Muokkaa tästä>" multiline={multiline }/>
    {isOpen && <ErrorMessage error={error} />}
  </>;
}
