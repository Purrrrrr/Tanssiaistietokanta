import React, {ComponentProps, useRef, useState} from 'react'
import {Classes} from '@blueprintjs/core'
import classNames from 'classnames'
import { MarkdownToJSX } from 'markdown-to-jsx'

import {Icon, Markdown} from 'libraries/ui'

import {SyncStatus} from '../SyncStatus'
import {ExtendedFieldComponentProps} from '../types'
import {SyncState} from '../useAutosavingState'
import {Input} from './basicComponents'
import {MarkdownEditor} from './MarkdownEditor'

import './ClosableEditor.sass'

export interface ClickToEditProps extends ExtendedFieldComponentProps<string, HTMLInputElement, ComponentProps<'input'>> {
  valueFormatter?: (value: string) => React.ReactNode
  inline?: boolean
  syncState?: SyncState
}
export function ClickToEdit({value, readOnly, valueFormatter, className, onChange, inline, syncState, ...props} : ClickToEditProps) {
  return <ClosableEditor
    className={className}
    inline={inline}
    readOnly={readOnly}
    aria-describedby={props['aria-describedby']}
    aria-label={props['aria-label']}
    closedValue={valueFormatter ? valueFormatter(value ?? '') : value}
  >
    {syncState && <SyncStatus state={syncState} />}
    <Input {...props} value={value} onChange={onChange} inline={inline} />
  </ClosableEditor>
}

export interface ClickToEditMarkdownProps extends ExtendedFieldComponentProps<string, HTMLTextAreaElement, ComponentProps<typeof MarkdownEditor>> {
  className?: string
  inline?: boolean
  markdownOverrides?: MarkdownToJSX.Overrides
  syncState?: SyncState
}
export function ClickToEditMarkdown({value, readOnly, className, onChange, inline, syncState, markdownOverrides, ...props} : ClickToEditMarkdownProps) {
  return <ClosableEditor
    className={classNames(className, 'closable-editor-markdown')}
    inline={inline}
    readOnly={readOnly}
    aria-describedby={props['aria-describedby']}
    aria-label={props['aria-label']}
    closedValue={<Markdown options={{overrides: markdownOverrides}}>{value ?? ''}</Markdown>}
  >
    {syncState && <SyncStatus state={syncState} />}
    <MarkdownEditor {...props} value={value} onChange={onChange} markdownOverrides={markdownOverrides} />
  </ClosableEditor>
}

interface ClosableEditorProps {
  closedValue: React.ReactNode
  showIcon?: boolean
  readOnly?: boolean
  inline?: boolean
  className?: string
  children: React.ReactNode
  'aria-describedby'?: string
  'aria-label'?: string
}

function ClosableEditor({closedValue, readOnly, inline, children, className, showIcon = true, ...props} : ClosableEditorProps) {
  const [open, setOpen] = useState(false)

  const container = useRef<HTMLDivElement>(null)
  function openEditor() {
    if (readOnly) return
    setOpen(true)
    setTimeout(() => (container.current?.querySelector('input, textarea') as HTMLElement)?.focus?.(), 10)
  }
  function maybeCloseEditor(e: React.FocusEvent<HTMLElement>) {
    const isInsideContainer = e.target !== container.current
    if (isInsideContainer) setOpen(false)
  }
  const Container = inline ? 'span' : 'div'
  const canOpen = !open && !readOnly

  return <Container
    ref={container}
    tabIndex={canOpen ? 0 : undefined}
    onClick={openEditor}
    onFocus={openEditor}
    onBlur={maybeCloseEditor}
    className={classNames(className, canOpen && Classes.EDITABLE_TEXT, 'closable-editor')}
    aria-describedby={canOpen ? undefined : props['aria-describedby']}
    aria-label={canOpen ? undefined : props['aria-label']}
  >
    {open || closedValue}
    {canOpen && showIcon && <Icon intent="primary" className="closable-editor-edit-icon" icon="edit" />}
    {open && children}
  </Container>
}
