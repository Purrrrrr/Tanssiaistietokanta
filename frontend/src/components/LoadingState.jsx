import React from 'react';
import {Button, NonIdealState, Spinner, Intent} from "@blueprintjs/core";

export function LoadingState({loading, error, refetch}) {
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
