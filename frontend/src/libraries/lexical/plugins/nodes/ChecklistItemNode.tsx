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
    if (isChecklistItem(this)) {
      dom.prepend(createCheckboxWrapper(this.getChecked() ?? false))
    }
    return dom
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const recreated = super.updateDOM(prevNode, dom, config)
    if (recreated) return true

    const checklist = isChecklistItem(this)
    const wrapper = dom.querySelector('span[data-lexical-checkbox]') as HTMLSpanElement | null
    const checkbox = wrapper?.querySelector('input[type="checkbox"]') as HTMLInputElement | null

    if (checklist && !wrapper) {
      dom.prepend(createCheckboxWrapper(this.getChecked() ?? false))
    } else if (!checklist && wrapper) {
      wrapper.remove()
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

function createCheckboxWrapper(checked: boolean): HTMLSpanElement {
  const span = document.createElement('span')
  span.contentEditable = 'false'
  span.dataset.lexicalCheckbox = ''
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.checked = checked
  input.tabIndex = -1
  span.appendChild(input)
  return span
}
