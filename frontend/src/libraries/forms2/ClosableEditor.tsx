import React from 'react';
import {Icon} from "../ui";
import {Classes} from "@blueprintjs/core";
import classNames from 'classnames';

interface ClosableEditorProps {
  open: boolean
  onOpen: () => unknown
  closedValue: React.ReactNode
  readOnly?: boolean
  inline?: boolean
  className?: string
  children: React.ReactNode
  "aria-describedby"?: string
  "aria-label"?: string
}

export function ClosableEditor({open, onOpen, closedValue, readOnly, inline, children, className, ...props} : ClosableEditorProps) {
  function openEditor() { 
    if (readOnly) return
    onOpen();
  }
  const Container = inline ? 'span' : 'div'
  const canOpen = !open && !readOnly

  return <Container
    tabIndex={canOpen ? 0 : undefined}
    onClick={openEditor}
    onFocus={openEditor}
    className={classNames(className, canOpen && Classes.EDITABLE_TEXT)}
    aria-describedby={canOpen ? undefined : props['aria-describedby']} 
    aria-label={canOpen ? undefined : props['aria-label']} 
  >
    {open || closedValue}
    {canOpen && <Icon intent="primary" icon="edit" />}
    {!readOnly && children}
  </Container>
}
