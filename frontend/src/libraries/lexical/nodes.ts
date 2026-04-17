import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'

import { ChecklistItemNode } from './plugins/CheckboxPlugin'
import { ImageNode } from './plugins/nodes/ImageNode'
import { LayoutContainerNode } from './plugins/nodes/LayoutContainerNode'
import { LayoutItemNode } from './plugins/nodes/LayoutItemNode'
import { QRCodeNode } from './plugins/nodes/QRCodeNode'

export const nodes = [
  HeadingNode, LinkNode,
  TableNode, TableCellNode, TableRowNode,
  ImageNode,
  LayoutContainerNode, LayoutItemNode,
  QRCodeNode,
  ListNode, ListItemNode, ChecklistItemNode, {
    replace: ListItemNode,
    with: (node: ListItemNode) => new ChecklistItemNode(node.getValue(), node.getChecked()),
    withKlass: ChecklistItemNode,
  },
]
