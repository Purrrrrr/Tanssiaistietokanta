import classNames from 'classnames'

import FormUiShowcase from 'libraries/formsV2/UiShowcase'
import { Icon } from 'libraries/ui'

import { titleCase } from './utils/titleCase'

const colors = ['neutral', 'primary', 'success', 'danger', 'warning'] as const
type Color = 'neutral' | 'primary' | 'success' | 'danger' | 'warning'

const colorClass = (color: Color, settings?: { interactive?: boolean }) => classNames(
  'shadow-xs shadow-stone-800/50 bg-(--current-bg)',
  ({
    neutral: '[--current-bg:_var(--color-stone-300)]',
    primary: '[--current-bg:_var(--color-sky-700)] text-white',
    success: '[--current-bg:_var(--color-lime-700)] text-white',
    danger: ' [--current-bg:_var(--color-orange-700)] text-white',
    warning: ' [--current-bg:_var(--color-amber-400)]',
  } satisfies Record<Color, string>)[color],
  settings?.interactive && 'cursor-pointer transition-colors hover:bg-[oklch(from_var(--current-bg)_calc(l_-_0.07)_c_h)] [:active,.active]:shadow-md [:active,.active]:bg-[oklch(from_var(--current-bg)_calc(l_-_0.12)_c_h)]',
)

const buttonClass = (color: Color) => classNames(
  'py-1.5 px-2 rounded-sm font-medium text-center flex gap-1.5 items-center',
  colorClass(color, { interactive: true }),
)

export default function UiShowcase() {
  return <section>
    <section className="p-2 bg-amber-50 h-100">
      <h1>Colors</h1>

      <a href="#">
        Link
      </a>

      {colors.map(color =>
        <p><button className={buttonClass(color)}><Icon icon="trash" />{titleCase(color)}</button></p>
      )}
    </section>

    <FormUiShowcase />
  </section>

}
