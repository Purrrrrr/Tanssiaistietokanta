import {Instance as Counterpart} from 'counterpart'

type Translation = string
type Translate = {
  (key: string | TemplateStringsArray, options?: object): Translation,
  pluralize: (key: string, count: number) => Translation
}

export function makeTranslate(strings) : Translate {
  const counterpart = new Counterpart()
  counterpart.registerTranslations('en', strings)

  const t = counterpart.translate.bind(counterpart)
  t.pluralize = (key, count: number) => t(key, {count})
  return t
}
