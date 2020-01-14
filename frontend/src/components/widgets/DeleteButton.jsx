import React, {useState} from 'react';
import {Alert, Button, Intent} from "@blueprintjs/core";

export function DeleteButton({onDelete, style, text, confirmText}) {
  const [showDialog, setShowDialog] = useState(false);
  return <>
    <Button style={style} icon="trash" text="Poista tanssi" intent={Intent.DANGER} onClick={() => setShowDialog(true)}/>
    <Alert isOpen={showDialog} onClose={() => setShowDialog(false)}
      onConfirm={onDelete}
      intent={Intent.DANGER}
      cancelButtonText="Peruuta"
      confirmButtonText="Poista">
      {confirmText}
    </Alert>
  </>;
}
