import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'
import { ListItemNode } from '@lexical/list'
import { $getNodeByKey } from 'lexical'

export function CheckboxUIPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerMutationListener(ListItemNode, (mutations) => {
      for (const [nodeKey, mutation] of mutations) {
        if (mutation === 'destroyed') continue
        const dom = editor.getElementByKey(nodeKey)
        if (!dom) continue
        const checkbox = dom.querySelector('input[type="checkbox"]') as HTMLInputElement | null
        if (!checkbox || checkbox.dataset.hasListener) continue

        checkbox.dataset.hasListener = 'true'
        checkbox.addEventListener('change', () => {
          editor.update(() => {
            const node = $getNodeByKey(nodeKey)
            if (node instanceof ListItemNode) {
              node.setChecked(checkbox.checked)
            }
          })
        })
      }
    })
  }, [editor])

  return null
}

export { ChecklistItemNode } from './nodes/ChecklistItemNode'
