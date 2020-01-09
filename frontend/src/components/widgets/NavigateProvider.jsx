import React from 'react';
import {Router} from "@reach/router"

export function NavigateProvider({children}) {
  return <Router primary={false}><NavigateReceiver path="/" renderer={children} /></Router>;
}

function NavigateReceiver({navigate, renderer}) {
  return renderer(navigate);
}
