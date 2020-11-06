import React, {useState} from 'react';
import {Alert, Intent} from "@blueprintjs/core";
import {Button} from "libraries/forms";

interface DeleteButtonProps {
  style?: any
  text: string 
  onDelete: () => any
  confirmText: string
}

export function DeleteButton({onDelete, style, text, confirmText} : DeleteButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  return <>
    <Button style={style} icon="trash" text={text} intent={Intent.DANGER} onClick={() => setShowDialog(true)}/>
    <Alert isOpen={showDialog} onClose={() => setShowDialog(false)}
      onConfirm={onDelete}
      intent={Intent.DANGER}
      cancelButtonText="Peruuta"
      confirmButtonText="Poista">
      {confirmText}
    </Alert>
  </>;
}
