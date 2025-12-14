import { useId } from 'react'

export function SelectionBox(props: Pick<React.ComponentProps<'input'>, 'value' | 'onChange'>) {
  const id = useId()

  return <label htmlFor={id} className="rounded-sm p-2 -mx-1 -my-2 hover:bg-sky-600/20 hover:*:not-checked:opacity-90">
    <input className="accent-sky-700" id={id} type="checkbox" {...props} />
  </label>
}
