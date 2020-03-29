import React, {useState} from "react";
import {Icon} from "@blueprintjs/core";
import "./PrintViewToolbar.sass";

export default function({children, icon = "settings"}) {
  const [isOpen, setOpen] = useState(true);

  return <div className={"print-view-toolbar " + (isOpen ? "open" : "closed")}>
    <Icon className="more" icon={icon} iconSize={20}
      tabIndex={0}
      onFocus={() => setOpen(true)}
    />
    <div className="contents">
      {children}
    </div>
    <Icon className="close" icon="double-chevron-up" iconSize={20}
      onClick={() => setOpen(false)}
    />
  </div>
}
