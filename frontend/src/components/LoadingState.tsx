import {ApolloError, ApolloQueryResult} from '@apollo/client'

import React from 'react'
import {NonIdealState, Spinner, Button} from 'libraries/ui'

interface LoadingStateProps {
  loading?: boolean,
  error?: ApolloError,
  refetch: (variables?: Record<string, unknown> | undefined) => Promise<ApolloQueryResult<Record<string, unknown>>>
}

export function LoadingState({loading, error, refetch} : LoadingStateProps) {
  if (loading) {
    return <Spinner size={100} /> //<NonIdealState icon={<Spinner />} />;
  }
  if (error) {
    return <NonIdealState icon="error"
      title="Tietojen lataaminen epäonnistui"
      description={error.message}
      action={<Button text="Yritä uudelleen" onClick={() => refetch()} intent="primary" />}
    />
  }
  return null
}
