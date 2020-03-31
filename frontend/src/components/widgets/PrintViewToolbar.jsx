import React, {useState} from "react";
import {Icon} from "@blueprintjs/core";
import "./PrintViewToolbar.sass";

export default function({children, icon = "settings", maxHeight}) {
  const [isOpen, setOpen] = useState(true);

  return <div className={"print-view-toolbar " + (isOpen ? "open" : "closed")}
    style={isOpen && maxHeight ? {maxHeight} : undefined}
  >
    <Icon className="more" icon={icon} iconSize={20}
      tabIndex={0}
      onFocus={() => setOpen(true)}
    />
    <div className="contents"
      style={maxHeight ? {maxHeight} : undefined}
    >
      {children}
    </div>
    <Icon className="close" icon="double-chevron-up" iconSize={20}
      onClick={() => setOpen(false)}
    />
  </div>
}
