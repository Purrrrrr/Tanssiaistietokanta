import { ID } from 'types'
import { FormationDiagram } from 'types/formationDiagrams'

import { useFormationDiagrams } from 'services/formationDiagrams'

import { FieldComponentProps } from 'libraries/forms'
import { Select } from 'libraries/formsV2/components/inputs'

interface CreateValue {
  _id: 'create'
  createNew: true
  description: string
}

interface FormationDiagramChooserProps extends FieldComponentProps<FormationDiagram | null | CreateValue> {
  emptyText?: string
  excludeItems?: ID[]
  allowCreate?: boolean
  createText?: string
}

export function FormationDiagramChooser({ value, readOnly, excludeItems, allowCreate, createText, ...props }: FormationDiagramChooserProps) {
  const [formationDiagrams] = useFormationDiagrams()

  if (readOnly) {
    if (!value) return null
    return <span>{value.description}</span>
  }

  const items = allowCreate
    ? [...formationDiagrams, { _id: 'create', description: createText ?? '-', createNew: true } satisfies CreateValue]
    : formationDiagrams

  return <Select<FormationDiagram | CreateValue | null>
    itemHidden={
      excludeItems
        ? formationDiagram => formationDiagram ? excludeItems.includes(formationDiagram._id) : false
        : undefined
    }
    value={value ?? null}
    items={items}
    itemToString={formationDiagram => formationDiagram ? formationDiagram.description : props.emptyText ?? ''}
    {...props}
  />
}
