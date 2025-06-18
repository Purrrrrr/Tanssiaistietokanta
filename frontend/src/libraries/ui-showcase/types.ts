import { ReactNode } from 'react'

export interface Showcase<P extends Record<string, unknown>> {
  title: string
  props: {
    [K in keyof P]: PropDef<P[K]>
  }
  render(props: P): ReactNode
}

export type PropDef<T> =
  | StringPropDef
  | NumberPropDef
  | BooleanPropDef
  | UnknownPropDef<T>

interface StringPropDef extends GenericPropDef<string> {
  type: 'string'
}

interface NumberPropDef extends GenericPropDef<number> {
  type: 'number'
  min?: number
  max?: number
  step?: number
}

interface BooleanPropDef extends GenericPropDef<boolean> {
  type: 'boolean'
}

interface UnknownPropDef<T> extends GenericPropDef<T> {
  type: 'other'
  renderControl(value: T, onChange: (value: T) => unknown): ReactNode
  default: T
}

interface GenericPropDef<out T> {
  default: T
  choices?: T[]
}

export function showcase<P extends Record<string, unknown>>(value: Showcase<P>): Showcase<P> {
  return value
}

export function stringProp(props?: Omit<StringPropDef, 'type'>): StringPropDef {
  return { type: 'string', default: '', ...props}
}

export function numberProp(props?: Omit<NumberPropDef, 'type'>): NumberPropDef {
  return { type: 'number', default: props?.min ?? 0, ...props}
}

export function booleanProp(props?: Omit<BooleanPropDef, 'type'>): BooleanPropDef {
  return { type: 'boolean', default: false, ...props}
}
