import {ApolloError, ApolloQueryResult} from '@apollo/client';

import React from 'react';
import {Button} from "libraries/forms";
import {NonIdealState, Spinner, Intent} from "@blueprintjs/core";

interface LoadingStateProps {
  loading?: boolean,
  error?: ApolloError,
  refetch: (variables?: any | undefined) => Promise<ApolloQueryResult<any>>
}

export function LoadingState({loading, error, refetch} : LoadingStateProps) {
  if (loading) {
    return <Spinner size={100} />; //<NonIdealState icon={<Spinner />} />;
  }
  if (error) {
    return <NonIdealState icon="error" 
      title="Tietojen lataaminen epäonnistui"
      description={error.message} 
      action={<Button text="Yritä uudelleen" onClick={() => refetch()} intent={Intent.PRIMARY} />}
    />;
  }
  return null;
}
