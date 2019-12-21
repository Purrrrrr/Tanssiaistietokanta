import React from "react";
import {Icon} from "@blueprintjs/core";
import "./PrintViewToolbar.sass";

export default function({children}) {
  return <div className="print-view-toolbar">
    <span className="contents">{children}</span>
    <Icon className="more" icon="more" />
  </div>
}
