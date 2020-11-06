describe('Event list', () => {
  it('visits home page', () => {
    cy.visit('/');
  })

  it('is accessible', () => {
    cy.injectAxe();
    cy.checkA11y();
  })
})
