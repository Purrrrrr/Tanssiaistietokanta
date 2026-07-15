import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import equal from 'fast-deep-equal'

const DEFAULT_MAX_HISTORY = 100

type EqualityFn<T> = (left: T, right: T) => boolean

interface UndoHistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

export interface UndoHistoryOptions<T> {
  maxHistory?: number
  isEqual?: EqualityFn<T>
}

export interface UndoHistoryResult {
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

function normalizeMaxHistory(maxHistory?: number) {
  if (maxHistory == null || Number.isNaN(maxHistory)) return DEFAULT_MAX_HISTORY
  return Math.max(0, Math.floor(maxHistory))
}

function trimPast<T>(past: T[], maxHistory: number) {
  if (maxHistory === 0) return []
  if (past.length <= maxHistory) return past
  return past.slice(past.length - maxHistory)
}

export function useUndoHistory<T>(
  value: T,
  onChange: (nextValue: T) => void,
  options: UndoHistoryOptions<T> = {},
): UndoHistoryResult {
  const maxHistory = normalizeMaxHistory(options.maxHistory)
  const isEqual = options.isEqual ?? equal

  const onChangeRef = useRef(onChange)
  const historyRef = useRef<UndoHistoryState<T>>({
    past: [],
    present: value,
    future: [],
  })

  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const updateAvailability = useCallback(() => {
    const nextCanUndo = historyRef.current.past.length > 0
    const nextCanRedo = historyRef.current.future.length > 0
    setCanUndo(nextCanUndo)
    setCanRedo(nextCanRedo)
  }, [])

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const history = historyRef.current
    const nextPast = trimPast(history.past, maxHistory)
    if (nextPast === history.past) return

    historyRef.current = {
      ...history,
      past: nextPast,
    }
    updateAvailability()
  }, [maxHistory, updateAvailability])

  useEffect(() => {
    const history = historyRef.current
    if (isEqual(value, history.present)) return

    historyRef.current = {
      past: trimPast([...history.past, history.present], maxHistory),
      present: value,
      future: [],
    }
    updateAvailability()
  }, [value, isEqual, maxHistory, updateAvailability])

  const undo = useCallback(() => {
    const history = historyRef.current
    const previous = history.past.at(-1)
    if (previous === undefined) return

    historyRef.current = {
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present, ...history.future],
    }
    updateAvailability()
    onChangeRef.current(previous)
  }, [updateAvailability])

  const redo = useCallback(() => {
    const history = historyRef.current
    const next = history.future[0]
    if (next === undefined) return

    historyRef.current = {
      past: trimPast([...history.past, history.present], maxHistory),
      present: next,
      future: history.future.slice(1),
    }
    updateAvailability()
    onChangeRef.current(next)
  }, [maxHistory, updateAvailability])

  return useMemo(() => ({
    undo,
    redo,
    canUndo,
    canRedo,
  }), [undo, redo, canUndo, canRedo])
}
