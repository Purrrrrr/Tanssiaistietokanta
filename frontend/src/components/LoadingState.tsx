import { ApolloError, ApolloQueryResult } from '@apollo/client'

import { useShowGlobalLoadingAnimation } from 'backend'

import { Button, ColorClass, H2 } from 'libraries/ui'
import { Error } from 'libraries/ui/icons'
import { useT } from 'i18n'

interface LoadingStateProps<Variables> {
  loading?: boolean
  error?: ApolloError
  refetch?: (variables?: Variables | undefined) => Promise<ApolloQueryResult<Record<string, unknown>>>
}

export function LoadingState<Variables>({ loading, error, refetch }: LoadingStateProps<Variables>) {
  const t = useT('components.loadingState')
  useShowGlobalLoadingAnimation(loading)
  if (error) {
    return <div className={`flex flex-col gap-3 justify-center items-center h-full ${ColorClass.textMuted}`}>
      <Error className="text-gray-400" size={48} />
      <H2>{t('errorMessage')}</H2>
      <p>{error.message}</p>
      {refetch &&
        <Button
          text={t('tryAgain')}
          onClick={() => refetch()}
          color="primary"
        />
      }
    </div>
  }
  return null
}
