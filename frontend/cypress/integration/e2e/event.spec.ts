import { before } from "cypress/types/lodash";

describe('Event page', () => {
  it('visits event page', () => {
    cy.visit('/events/GsiRDI7oYFXRnDZ3');
  })

  it('is accessible', () => {
    cy.injectAxe();
    cy.checkA11y();
  })
})
