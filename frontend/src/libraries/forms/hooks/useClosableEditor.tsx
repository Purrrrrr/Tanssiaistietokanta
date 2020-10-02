import {useState, useEffect, useCallback} from 'react';
import {useError} from "../validation";

interface EditorOptions {
  validationSchema?: object,
}

export function useClosableEditor(
  originalValue,
  onChange,
  {validationSchema = {} } : EditorOptions = {}
) {
  const [isOpen, setOpen] = useState(false);
  const [value, setValue] = useState(originalValue);
  useEffect(() => setValue(originalValue), [originalValue]);

  const error = useError(value, validationSchema);
  const onOpen = useCallback(() => setOpen(true), [setOpen]);

  const onConfirm = useCallback(() => {
    if (error) return;
    setOpen(false);
    value === originalValue || onChange(value);
  }, [setOpen, value, originalValue, onChange, error]);

  const onCancel = useCallback(() => {
    setOpen(false);
    setValue(originalValue);
  }, [originalValue, setOpen, setValue]);


  return {
    value, onChange: setValue,
    isOpen, onOpen, onConfirm, onCancel, error,
  };

}
