import React, {createContext, useState, useEffect, useRef, useContext} from 'react';
import {Breadcrumbs as BlueprintBreadcrumbs, Breadcrumb as BlueprintBreadcrumb} from "@blueprintjs/core";
import {navigate} from "@reach/router"
import {sorted} from "utils/sorted"

const RegisterContext = createContext();
const PathContext = createContext();

export function BreadcrumbContext({children}) {
  const [paths, setPaths] = useState([]);
  const val = useRef({
    add: (v) => setPaths((old) => add(old, v)),
    remove: (v) => setPaths((old) => remove(old, v))
  });
  return <RegisterContext.Provider value={val.current}>
    <PathContext.Provider value={paths}>
      {children}
    </PathContext.Provider>
  </RegisterContext.Provider>;
}

function add(array, value) {
  const index = array.indexOf(value);
  return index === -1 ? [...array, value] : array;
}

function remove(array, value) {
  const index = array.indexOf(value);
  return index === -1 ? array : array.filter(item => item !== value);
}

export function Breadcrumbs() {
  const paths = useContext(PathContext);
  return <BlueprintBreadcrumbs items={sortedPaths(paths)} breadcrumbRenderer={BreadcrumbItem} />;
}

function BreadcrumbItem(props) {
  const onClick = props.onClick
    || ((e) => {navigate(props.href || "/"); e.preventDefault();});

  return <BlueprintBreadcrumb {...props} onClick={onClick} />;
}

function sortedPaths(paths) {
  return sorted(paths, (a, b) => {
    return depth(a) - depth(b);
  });
}

function depth(path) {
  return (path.href|| "").split("/").length;
}

export const Breadcrumb = React.memo(function(props) {
  const paths = useContext(RegisterContext);
  useEffect(() => {
    paths.add(props);
    return () => paths.remove(props);
  }, [props, paths]);

  return null;
});

