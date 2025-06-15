import classNames from 'classnames'

import FormUiShowcase from 'libraries/formsV2/UiShowcase'
import { Button } from 'libraries/ui'

import { titleCase } from './utils/titleCase'

const colors = ['none', 'primary', 'success', 'danger', 'warning'] as const

export default function UiShowcase() {
  return <section>
    <section className="p-2 bg-amber-50 h-100">
      <h1>Colors</h1>

      <a href="#">
        Link
      </a>

      {colors.map(color =>
        <p><Button intent={color} icon="trash">{titleCase(color)}</Button></p>
      )}
    </section>

    <FormUiShowcase />
  </section>

}
