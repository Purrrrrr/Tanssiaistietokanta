import {useState, useEffect, useCallback} from 'react';
import {useError} from "../validation";

interface EditorOptions {
  validationSchema?: object,
  onBlur?: (event?: any) => any,
}

export function useClosableEditor(
  originalValue,
  onChange,
  {validationSchema = {}, onBlur = undefined} : EditorOptions = {}
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
    onBlur && onBlur();
  }, [setOpen, value, originalValue, onChange, error, onBlur]);

  const onCancel = useCallback(() => {
    setOpen(false);
    setValue(originalValue);
    onBlur && onBlur();
  }, [originalValue, setOpen, setValue, onBlur]);


  return {
    value, onChange: setValue,
    isOpen, onOpen, onConfirm, onCancel, error,
  };

}
