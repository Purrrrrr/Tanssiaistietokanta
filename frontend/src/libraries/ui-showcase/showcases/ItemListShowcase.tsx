import { booleanProp, showcase } from '../types'

import { useMultipleSelection } from 'libraries/common/selection/useMultipleSelection'
import { Button, ItemList } from 'libraries/ui'

export function ItemListShowcase({ isTable, empty }: { isTable: boolean, empty: boolean }) {
  const items = Array(20).fill(0).map((_, i) => ({
    _id: String(i),
    name: `Item ${i}`,
    letter: String.fromCharCode(90 - i),
  }))
  const selection = useMultipleSelection(items)

  return <ItemList
    id="ui-showcase-itemlist"
    isTable={isTable}
    selection={selection}
    items={empty ? [] : items}
    emptyText="No items"
    labelTranslator={(id: string) => id.slice(0, 1).toUpperCase() + id.slice(1)}
    columns={[
      {
        key: 'name',
      },
      {
        key: 'letter',
      },
      {
        key: 'description',
        content: item => `This is a description for ${item.name}`,
        sortBy: 'name',
      },
    ]}
    expandableContent={(item, close) => <div className="flex items-center gap-2 p-2">
      More content goes here for {item.name} <Button text="Close" onClick={close} />
    </div>}
  />
}

ItemListShowcase.showCase = showcase({
  title: 'ItemList',
  props: {
    isTable: booleanProp({ default: true }),
    empty: booleanProp({ default: false }),
  },
  render: props => <ItemListShowcase {...props} />,
})
