// ***********************************************************
// This example support/index.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-axe';

// Alternatively you can use CommonJS syntax:
// require('./commands')
const resizeObserverLoopError = /ResizeObserver loop limit exceeded/

Cypress.on('uncaught:exception', (err) => {
  if (err.message.match(resizeObserverLoopError)) {
    /* Do not fail on resize observer errors (the come from some library and don't really affect the page */
    return false;
  }
})
