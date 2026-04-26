import { createContext, useContext, useEffect, useMemo, useState } from 'react'

interface TranslationContextValue {
  locale: string
  setLocale: (locale: string) => void
  namespaces: Namespaces
  addNamespace: (namespace: symbol, translations: Record<string, unknown>) => void
}

type Namespaces = Record<symbol, Record<string, unknown>>

const TranslationContext = createContext<TranslationContextValue>({
  locale: '',
  setLocale: () => {},
  namespaces: {},
  addNamespace: () => {},
})

export function TranslationProvider({
  defaultLanguage,
  children,
}: {
  defaultLanguage: string
  children: React.ReactNode
}) {
  const [locale, setLocale] = useState(defaultLanguage)
  const [namespaces, setNamespaces] = useState<Namespaces>({})

  const addNamespace = (namespace: symbol, translations: Record<string, unknown>) => {
    setNamespaces((prev) => ({ ...prev, [namespace]: translations }))
  }

  const value = useMemo(() => ({
    locale,
    setLocale,
    namespaces,
    addNamespace,
  }), [locale, namespaces])

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslationNamespace(namespace: symbol, translations: Record<string, unknown>) {
  const { addNamespace, namespaces } = useContext(TranslationContext)
  useEffect(
    () => {
      if (namespaces[namespace] === translations) return
      addNamespace(namespace, translations)
    },
    [addNamespace, namespace, namespaces, translations],
  )
}

export function useLocalization() {
  const { locale, setLocale } = useContext(TranslationContext)
  return { locale, setLocale }
}

export function useLocale() {
  return useContext(TranslationContext).locale
}

export function useTranslations(namespace: symbol) {
  const namespaces = useContext(TranslationContext)
  return namespaces[namespace]
}
