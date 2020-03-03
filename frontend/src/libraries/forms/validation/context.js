import React, {createContext, useMemo, useState, useContext, useEffect} from 'react';

export const ErrorCollectionContext = createContext();

export function useValidationResult() {
  const [errorCount, setErrorCount] = useState(0);
  const context = useMemo(() => {
    const errors = new Map();
    return {
      errors,
      addError: (identity, error) => {
        errors.set(identity, error);
        setErrorCount(errors.size);
      },
      removeError: (identity) => {
        if (errors.has(identity)) {
          errors.delete(identity);
          setErrorCount(errors.size);
        }
      }
    }
  }, []);
  const hasErrors = errorCount !== 0;

  const Provider = useMemo(
    () => ({children}) => 
      <ErrorCollectionContext.Provider children={children} value={context} />,
    [context]
  );

  return {hasErrors, ValidationContainer: Provider};
}

let counter = 0;

export function useUpdateErrorContext(error) {
  const identity = useMemo(() => counter++, []);
  const context = useContext(ErrorCollectionContext);
  useEffect(
    () => {
      if (!context) return;
      error ? context.addError(identity, error) : context.removeError(identity);
      return () => context.removeError(identity);
    },
    [error, identity, context]
  );
}
