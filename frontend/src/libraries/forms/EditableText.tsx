import React  from 'react';
import {EditableText as BlueprintEditabletext} from "@blueprintjs/core";
import {ErrorMessage, ValidationProps} from "./validation";
import {useClosableEditor} from "./hooks/useClosableEditor";

interface EditableTextProps extends ValidationProps{
  value: any
  onChange: (any) => any,
  defaultValue?: any,
  multiline?: boolean
}

export function EditableText(
  {value: maybeValue, onChange, defaultValue = "", multiline, ...validationSchema} : EditableTextProps
) {
  const {isOpen, onOpen, error, ...props} = useClosableEditor(
    maybeValue ?? defaultValue, onChange, {validationSchema}
  );

  return <>
    <BlueprintEditabletext {...props} isEditing={isOpen} onEdit={onOpen}
      placeholder="<Muokkaa tästä>" multiline={multiline }/>
    {isOpen && <ErrorMessage error={error} />}
  </>;
}
