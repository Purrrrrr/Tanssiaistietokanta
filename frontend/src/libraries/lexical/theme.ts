import '../ui/Markdown.css'

export const theme = {
  link: 'cursor-pointer text-link hover:underline',
  text: {
    bold: 'font-bold',
    code: 'font-mono',
    italic: 'italic',
    strikethrough: 'line-through',
    subscript: 'align-sub',
    superscript: 'align-super',
    underline: 'underline',
    underlineStrikethrough: '[text-decoration:underline_line-through]',
  },
  list: {
    listitemChecked: 'checked',
    listitemUnchecked: 'unchecked',
  },
  layoutContainer: 'grid',
  layoutItem: 'p-2 border-1 border-gray-200 rounded-md',
}
