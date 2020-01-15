import React, {useCallback} from 'react';
import {Button, Intent} from "@blueprintjs/core";
import {NavigateProvider} from "./NavigateProvider"
import { useMutation } from 'services/Apollo';

export function MutateButton({successUrl, ...props}) {
  return successUrl
    ? <NavigateProvider>
      {navigate => MutateButtonImpl({onSubmit: () => navigate(successUrl), ...props})}
    </NavigateProvider>
    : MutateButtonImpl(props);
}

function MutateButtonImpl({mutation, onSubmit, options = {}, variables, refetchQueries, ...buttonProps}) {
  const [mutate, mutationState] = useMutation(mutation, {
    onCompleted: onSubmit,
    ...options
  });

  const onClick = useCallback(
    () => {
      const vars = typeof(variables) === 'function' ?
        variables() : variables;
      mutate({variables: vars, refetchQueries});
    },
    [mutate, variables, refetchQueries]
  );

  return <Button intent={Intent.PRIMARY} {...buttonProps} 
    onClick={onClick} loading={mutationState.loading} />;
}
