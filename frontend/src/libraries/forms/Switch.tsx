import {Switch as BlueprintSwitch, ISwitchProps} from "@blueprintjs/core";
import { JSXElementConstructor } from "react";

/* Force labeling of switches! */
interface SwitchProps extends Omit<ISwitchProps, 'label'> {
  label: string
}

export const Switch : React.JSXElementConstructor<SwitchProps> = (BlueprintSwitch as JSXElementConstructor<SwitchProps>);
