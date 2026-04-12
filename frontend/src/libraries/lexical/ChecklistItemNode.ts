import { ListItemNode, ListNode } from '@lexical/list'
import type { EditorConfig } from 'lexical'

export class ChecklistItemNode extends ListItemNode {
  static getType(): string {
    return 'checklist-item'
  }

  static clone(node: ChecklistItemNode): ChecklistItemNode {
    return new ChecklistItemNode(node.getValue(), node.getChecked(), node.getKey())
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config)
    console.log(dom.childNodes)
    if (isChecklistItem(this)) {
      dom.prepend(createCheckboxInput(this.getChecked() ?? false))
    }
    return dom
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const recreated = super.updateDOM(prevNode, dom, config)
    if (recreated) return true

    const checklist = isChecklistItem(this)
    let checkbox = dom.querySelector('input[type="checkbox"]') as HTMLInputElement | null

    if (checklist && !checkbox) {
      checkbox = createCheckboxInput(this.getChecked() ?? false)
      dom.prepend(checkbox)
    } else if (!checklist && checkbox) {
      checkbox.remove()
    } else if (checkbox) {
      checkbox.checked = this.getChecked() ?? false
    }

    return recreated
  }
}

function isChecklistItem(node: ListItemNode): boolean {
  const parent = node.getParent()
  return parent instanceof ListNode && parent.getListType() === 'check'
}

function createCheckboxInput(checked: boolean): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.checked = checked
  return input
}
