import { useCallback, useContext, useEffect, useId, useState } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import type { AnyType, FieldPath, ValidationProps } from './types'
import { DroppableData, ItemData, ListItem } from './components/ListEditor/types'

import { type ExternalBareFieldContainerProps, BareFieldContainer } from './components/FieldContainer'
import type { FieldInputComponent, FieldInputComponentProps, OmitInputProps } from './components/inputs'
import { ItemVisitContext } from './components/ListEditor/context'
import { Droppable } from './components/ListEditor/Droppable'
import { SortableItem } from './components/ListEditor/SortableItem'
import { useFormContext } from './context'
import { useRunValidation } from './hooks'
import { change } from './reducer'

export type UnwrappedFieldProps<Output extends Input, Extra, Input extends ListItem, Data = AnyType> = ValidationProps &
  ExternalBareFieldContainerProps &
  OmitInputProps<Extra> & {
    component: FieldInputComponent<Output, Extra, Input>
    path: FieldPath<Output[], Output[], Data>
  }

const getId = (value: ListItem) => typeof value === 'object'
  ? value._id : value

export function ListField<Output extends Input, Extra, Input extends ListItem, Data = AnyType>({path, label, component: C, required, schema, ...extra}: UnwrappedFieldProps<Output, Extra, Input, Data>) {
  const { value: values, onChange, inputProps, containerProps } = useFieldValueProps<Output[], Output[], Data>(path, { required, schema })
  const fieldId = useId()
  const items = useItems(fieldId, path, values)
  const ids = items.map(item => item.id)

  return <BareFieldContainer {...containerProps} label={label}>
    <Droppable
      data={ { type: 'droppable', path, fieldId } satisfies DroppableData}
      disabled={values.length > 0}
    >
      <SortableContext id={fieldId} items={ids} strategy={verticalListSortingStrategy}>
        {
          items.map(
            (data) =>
              <SortableItem id={data.id} data={data} key={data.id}>
                <C
                  {...inputProps}
                  value={data.value}
                  onChange={(newItem: Output) => {
                    const newVal = [...values]
                    newVal[data.index] = newItem
                    onChange(newVal)
                  }}
                  {...extra as Extra}
                />
              </SortableItem>
          )
        }
      </SortableContext>
    </Droppable>
  </BareFieldContainer>
}

function useItems<T extends ListItem>(fieldId: string, path: string | number, values: T[]): ItemData<T>[] {
  const itemVisit = useContext(ItemVisitContext)
  const toItem = (value: T, index: number) => ({
    type: 'item',
    fieldId,
    id: getId(value),
    index, path, value,
  } satisfies ItemData<T>)
  const items = values.map(toItem)

  if (itemVisit) {
    if (itemVisit.to.fieldId === fieldId) {
      return [
        ...items,
        itemVisit.item as ItemData<T>,
      ]
    }
    if (itemVisit.item.fieldId === fieldId) {
      const ghostIndex = itemVisit.item.index
      return items.map((item, index) => index === ghostIndex ? makeGhost(item) : item)
    }
  }
  return items
}

function makeGhost<T>(item: ItemData<T>): ItemData<T> {
  return {
    ...item,
    ghost: true,
    id: `${item.id}-ghost`
  }
}

function useFieldValueProps<Output extends Input, Input, Data = unknown>(path: FieldPath<Input, Output, Data>, validation: ValidationProps) {
  const id = `${path}:${useId()}`
  const errorId = `${id}-error`
  const { readOnly, getValueAt, dispatch, subscribe } = useFormContext<Data>()
  const [value, setValue] = useState(() => getValueAt<Input>(path))
  const error = useRunValidation(path, id, value, validation)

  useEffect(
    () => subscribe(() => setValue(getValueAt(path))),
    [subscribe, path, getValueAt]
  )

  const onChange = useCallback((value: Output) => {
    setValue(value)
    dispatch(change(path, value))
  }, [dispatch, path])

  const inputProps = {
    value, onChange, id, readOnly, 'aria-describedby': errorId,
  } satisfies FieldInputComponentProps<Output, Input>
  const containerProps = {
    error, errorId, labelFor: id,
  }

  return {
    value, onChange, readOnly,
    inputProps,
    containerProps
  }
}
