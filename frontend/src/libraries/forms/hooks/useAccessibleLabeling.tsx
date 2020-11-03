import React from 'react';
import {FormGroup} from "@blueprintjs/core";
import {useStableId} from './useStableId';

export interface LabelingProps {
  labelStyle?: LabelStyle
  label: Label
  id?: string
  labelInfo?: string
  helperText?: string
}

type LabelStyle = 'inline' | 'above' | 'hidden';
type Label = string;

export function useAccessibleLabeling(
  {
    id: maybeId,
    labelStyle, label, labelInfo, helperText,
    ...props
  } : LabelingProps & any
) {
  const id = useStableId(maybeId, label);
  const addLabel = getLabelWrapper({labelFor: id, labelStyle, label, labelInfo, helperText});
  const fieldProps = {id, ...props};
  if (labelStyle === 'hidden') {
    fieldProps['aria-label'] = label;
  }
  return {addLabel, fieldProps};
}

type LabelWrapperProps = Omit<LabelingProps, 'id'> & {labelFor: string};
type LabelWrapper = (nodes: JSX.Element) => JSX.Element;

function getLabelWrapper({labelStyle, ...props} : LabelWrapperProps) : LabelWrapper {
  switch (labelStyle) {
    default:
    case 'above':
    return children => <FormGroup {...props} children={children} />;
    case 'inline':
    return children => <FormGroup inline {...props} children={children} />;
    case 'hidden':
    return children => <>{children}</>;
  }
}
